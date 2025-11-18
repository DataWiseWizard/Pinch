const Pin = require("../models/pin");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../config/cloudConfig");

module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalPins = await Pin.countDocuments();

    const allPins = await Pin.find({})
        .sort({ _id: -1 })
        .populate("postedBy")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        pins: allPins,
        currentPage: page,
        totalPages: Math.ceil(totalPins / limit),
        hasMore: (page * limit) < totalPins
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("pins/new.ejs");
};



module.exports.createPin = async (req, res, next) => {
    const newPin = new Pin(req.body.pin);

    newPin.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    newPin.postedBy = req.user._id;

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
                    autocomplete: {
                        query: q,
                        path: "title",
                        fuzzy: {
                            maxEdits: 2, 
                        },
                    },
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