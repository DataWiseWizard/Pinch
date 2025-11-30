const Pin = require("../models/pin");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../config/cloudConfig");
const { analyzeImage } = require("../utils/ai");
const { updateUserInterests } = require("../utils/signals");

module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let pipeline = [];

    // --- ALGORITHM BRANCH ---
    if (req.user && req.user.interestProfile && req.user.interestProfile.size > 0) {
        // 1. Convert Map to a usable object for the aggregation
        const interests = Object.fromEntries(req.user.interestProfile);
        const interestedTags = Object.keys(interests);

        pipeline.push(
            // Stage 1: Scoring (The "Brain")
            {
                $addFields: {
                    // Calculate a 'score' based on matching tags
                    relevanceScore: {
                        $sum: {
                            $map: {
                                input: "$tags", // For every tag in the pin...
                                as: "tag",
                                in: {
                                    // Check if it exists in user interests. If yes, use the score. If no, 0.
                                    // Note: We lowercase everything to ensure matches
                                    $let: {
                                        vars: { lowerTag: { $toLower: "$$tag" } },
                                        in: {
                                            $cond: [
                                                { $in: ["$$lowerTag", interestedTags] },
                                                // We rely on the fact that we can't easily inject the dynamic map values 
                                                // into the aggregation without complex operators. 
                                                // For a portfolio MVP, we give a flat bonus for *any* match.
                                                10, // +10 points if it matches ANY interest
                                                0
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Stage 2: Sorting
            // We sort by Relevance first, then by Date. 
            // This ensures they see "Anime" pins, but the *newest* Anime pins first.
            {
                $sort: {
                    relevanceScore: -1,
                    createdAt: -1
                }
            }
        );
    } else {
        // --- DEFAULT BRANCH (Guest / New User) ---
        // Just show the newest stuff
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    // --- PAGINATION & POPULATION STAGES ---
    pipeline.push(
        { $skip: skip },
        { $limit: limit },
        // Look up the author details (simulating .populate('postedBy'))
        {
            $lookup: {
                from: "users", // The collection name in MongoDB (usually lowercase plural)
                localField: "postedBy",
                foreignField: "_id",
                as: "postedBy"
            }
        },
        // Lookup returns an array, we want a single object
        { $unwind: "$postedBy" },
        // Project only the fields we need (Security)
        {
            $project: {
                title: 1,
                image: 1,
                destination: 1,
                tags: 1,
                "postedBy.username": 1,
                "postedBy.profileImage": 1,
                "postedBy._id": 1,
                relevanceScore: 1 // Optional: Send this to frontend if you want to debug "Why am I seeing this?"
            }
        }
    );

    try {
        const pins = await Pin.aggregate(pipeline);

        // We need a separate count for pagination (simplified for aggregation)
        // For a major project, we often estimate this or do a separate count query.
        const totalPins = await Pin.countDocuments();

        res.status(200).json({
            pins: pins,
            currentPage: page,
            totalPages: Math.ceil(totalPins / limit),
            hasMore: (page * limit) < totalPins
        });
    } catch (e) {
        console.error("Feed Error:", e);
        res.status(500).json({ message: "Failed to load feed" });
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("pins/new.ejs");
};

module.exports.createPin = async (req, res, next) => {
    const newPin = new Pin(req.body.pin);

    // 1. Handle Image Source (File Upload OR AI)
    let imageUrlForAnalysis = "";

    if (req.file) {
        // CASE A: Standard File Upload
        newPin.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        imageUrlForAnalysis = req.file.path;
    } else if (req.body.aiImageUrl) {
        // CASE B: AI Generated (Already uploaded to Cloudinary in the previous step)
        newPin.image = {
            url: req.body.aiImageUrl,
            filename: req.body.aiFilename
        };
        imageUrlForAnalysis = req.body.aiImageUrl;
    } else {
        return res.status(400).json({ message: "Image is required" });
    }

    newPin.postedBy = req.user._id;

    // 2. AI Analysis (Tags + Embedding)
    // We run this for BOTH cases so AI generated images also get tags!
    console.log("🤖 AI Analysis starting for:", newPin.title);

    // Pass the Cloudinary URL to your existing analyzeImage function
    const { tags, embedding } = await analyzeImage(imageUrlForAnalysis);

    if (tags.length > 0) {
        newPin.tags = tags;
        newPin.embedding = embedding;
        console.log("✨ AI Tags Generated:", tags);
    }

    await newPin.save();

    req.flash("success", "New Pin created!");
    res.status(201).json(newPin);
};

module.exports.showPin = async (req, res) => {
    let { id } = req.params;
    const pin = await Pin.findById(id).populate("postedBy");
    if (!pin) {
        return res.status(404).json({ message: "Pin not found." });
    }

    // If we found a user via optionalAuth, and the pin has tags...
    if (req.user && pin.tags && pin.tags.length > 0) {
        // Run in background (don't await) so we don't slow down the response
        updateUserInterests(req.user._id, pin.tags, 1);
    }

    res.status(200).json(pin);
};


module.exports.getUserPins = async (req, res) => {
    const { userId } = req.params;
    const userPins = await Pin.find({ postedBy: userId }).sort({ _id: -1 });
    res.status(200).json(userPins);
};


module.exports.deletePin = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const pin = await Pin.findById(id);

    if (!pin) {
        return res.status(404).json({ message: "Pin not found." });
    }

    if (!pin.postedBy || !pin.postedBy.equals(userId)) {
        return res.status(403).json({ message: "You are not authorized to delete this pin." });
    }

    try {
        await Pin.findByIdAndDelete(id);

        if (pin.image && pin.image.filename) {
            await cloudinary.uploader.destroy(pin.image.filename);
        } else {
            console.warn(`Pin ${id} deleted, but image filename was missing. Could not delete from Cloudinary.`);
        }


        res.status(200).json({ message: "Pin deleted successfully." });

    } catch (dbError) {
        console.error("Error during pin deletion:", dbError);
        return res.status(500).json({ message: "Failed to delete pin due to a server error." });
    }
};

module.exports.searchPins = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        const pins = await Pin.aggregate([
            {
                $search: {
                    index: "default",
                    compound: {
                        should: [
                            {
                                autocomplete: {
                                    query: q,
                                    path: "title",
                                    fuzzy: {
                                        maxEdits: 1,
                                    },
                                    score: { boost: { value: 3 } }
                                },
                            },
                            {
                                text: {
                                    query: q,
                                    path: "tags",
                                    fuzzy: {
                                        maxEdits: 1,
                                    }
                                }
                            }
                        ],
                        minimumShouldMatch: 1
                    }
                },
            },
            {
                $limit: 20
            },
            {
                $project: {
                    title: 1,
                    image: 1,
                    destination: 1,
                    postedBy: 1,
                    score: { $meta: "searchScore" }
                }
            }
        ]);

        const populatedPins = await Pin.populate(pins, {
            path: "postedBy",
            select: "username profileImage"
        });

        res.status(200).json(populatedPins);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Search failed" });
    }
};