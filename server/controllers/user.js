const User = require("../models/user");
const Pin = require("../models/pin");
const Board = require("../models/board");
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/Token');
const { sendVerificationEmail } = require('../utils/Email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../utils/jwt');
const { cloudinary } = require('../config/cloudConfig');
const ExpressError = require('../utils/ExpressError');


module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
};

// module.exports.signup = async (req, res, next) => {
//     try {
//         let { username, email, password } = req.body;

//         // Hash the password before saving
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const verificationToken = generateToken();

//         const newUser = new User({ email, username, displayName: username, password: hashedPassword, verificationToken: verificationToken, verificationTokenExpires: Date.now() + 3600000 });
//         await newUser.save();
//         await sendVerificationEmail(newUser.email, verificationToken);


//         res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });
//     } catch (e) {
//         if (e.code === 11000) {
//             return res.status(409).json({ message: "An account with that email already exists." });
//         } else {
//             return res.status(400).json({ message: e.message });
//         }
//     }
// };

// module.exports.verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.query;
//         if (!token) {
//             req.flash("error", "Verification failed. Token is missing.");
//             return res.redirect("/login");
//         }

//         const user = await User.findOne({
//             verificationToken: token,
//             verificationTokenExpires: { $gt: Date.now() }
//         })

//         if (!user) {
//             req.flash("error", "Invalid or expired verification token.");
//             return res.redirect("/login");
//         }

//         user.isVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         await user.save();

//         req.login(user, (err) => {
//             {
//                 if (err) { return next(err); }
//                 req.flash("success", "Email verified successfully! You are now logged in.");
//                 res.redirect("/pins");
//             }
//         })

//     } catch (error) {
//         req.flash("error", "Something went wrong during verification.");
//         res.redirect("/login");
//     }
// }

// module.exports.renderLoginForm = (req, res) => {
//     res.render("./users/login.ejs");
// };

// module.exports.login = async (req, res) => {
//     // Force session save before sending response
//     req.session.save((err) => {
//         if (err) {
//             console.error('[Login] Session save error:', err);
//             return res.status(500).json({ message: "Session error" });
//         }
//         res.status(200).json({
//             message: "Login successful!",
//             user: req.user
//         });
//     });
// };

// module.exports.logout = (req, res, next) => {
//     req.logout((err) => {
//         if (err) { return next(err); }
//         req.flash("success", "You are logged out now!");
//         res.redirect("/pins");
//     });
// };

// module.exports.toggleSavePin = async (req, res, next) => {
//     const { pinId } = req.params;
//     // Ensure user is attached
//     if (!req.user || !req.user._id) {
//         console.error("[toggleSavePin] Error: User not found on request object.");
//         return next(new ExpressError(401, "Authentication error: User not identified."));
//     }
//     const userId = req.user._id;

//     try {
//         console.log(`[toggleSavePin] User ${userId} toggling save for pin ${pinId}`); // Log: Start toggle
//         // Fetch both user and pin concurrently
//         const [user, pin] = await Promise.all([
//             User.findById(userId),
//             Pin.findById(pinId) // Check if pin exists
//         ]);

//         if (!user) { // Should be caught by isLoggedIn, but good safety check
//             console.error(`[toggleSavePin] User not found in DB: ${userId}`);
//             return res.status(404).json({ message: "User not found." });
//         }
//         if (!pin) {
//             console.warn(`[toggleSavePin] Pin not found: ${pinId}`);
//             return res.status(404).json({ message: "Pin not found." });
//         }

//         const savedIndex = user.savedPins.findIndex(savedId => savedId.equals(pinId));
//         let message;

//         if (savedIndex > -1) {
//             user.savedPins.splice(savedIndex, 1);
//             message = "Pin unsaved successfully.";
//             console.log(`[toggleSavePin] User ${userId} unsaved pin ${pinId}`); // Log: Unsave
//         } else {
//             user.savedPins.push(pinId);
//             message = "Pin saved successfully.";
//             console.log(`[toggleSavePin] User ${userId} saved pin ${pinId}`); // Log: Save
//         }

//         console.log(`[toggleSavePin] Attempting to save user ${userId}`); // Log: Before save
//         const updatedUser = await user.save(); // Await the save
//         console.log(`[toggleSavePin] User ${userId} saved successfully.`); // Log: After save

//         // Return the confirmed list of saved pin *IDs*
//         const updatedSavedPinIds = updatedUser.savedPins.map(id => id.toString());

//         res.status(200).json({
//             message,
//             savedPins: updatedSavedPinIds // Send updated IDs
//         });

//     } catch (error) {
//         console.error(`[toggleSavePin] CRITICAL ERROR for user ${userId}, pin ${pinId}:`, error);
//         next(new ExpressError(500, `Could not update saved pins. Details: ${error.message}`));
//     }
// };

// module.exports.getSavedPins = async (req, res, next) => {
//     // Check if user is properly attached by middleware
//     if (!req.user || !req.user._id) {
//         console.error("[getSavedPins] Error: User not found on request object. Middleware issue?");
//         // Use next to pass error to central handler
//         return next(new ExpressError(401, "Authentication error: User not identified."));
//     }

//     const userId = req.user._id;
//     console.log(`[getSavedPins] Attempting to fetch saved pins for user: ${userId}`); // Log: Start

//     try {
//         console.log(`[getSavedPins] Finding user document for ID: ${userId}`); // Log: Before find
//         const user = await User.findById(userId);

//         if (!user) {
//             console.error(`[getSavedPins] User document not found in DB for ID: ${userId}`);
//             // Send 404 directly as user genuinely doesn't exist
//             return res.status(404).json({ message: "User not found." });
//         }
//         console.log(`[getSavedPins] User document found. User has ${user.savedPins?.length ?? 0} saved pin references.`); // Log: User found

//         // *** Fetch and Populate Saved Pins Separately ***
//         // This helps isolate population errors
//         console.log(`[getSavedPins] Attempting to find and populate pins with IDs: ${user.savedPins}`);
//         const populatedPins = await Pin.find({
//             '_id': { $in: user.savedPins } // Find pins whose IDs are in the user's savedPins array
//         }).populate({
//             path: 'postedBy',
//             select: 'username profileImage _id'
//         });
//         console.log(`[getSavedPins] Successfully populated ${populatedPins.length} pins.`); // Log: Population success

//         // Although Pin.find with $in naturally filters out non-existent IDs,
//         // it's good practice, especially if the savedPins array could contain duplicates or invalid entries
//         // Note: The previous filtering of nulls after populate isn't needed with this approach.

//         res.status(200).json(populatedPins || []); // Send the successfully populated pins

//     } catch (error) {
//         // *** Log the *specific* error that occurred ***
//         console.error(`[getSavedPins] CRITICAL ERROR fetching/populating saved pins for user ${userId}:`, error);
//         // Pass a detailed error to the central handler
//         next(new ExpressError(500, `Server error fetching saved pins. Details: ${error.message}`));
//     }
// };

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = generateToken();

        const newUser = new User({
            email,
            username,
            displayName: username,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpires: Date.now() + 3600000
        });

        // This is the primary goal: create the user
        await newUser.save();

        // --- FIX: Handle email sending in its own try/catch ---
        try {
            // Attempt to send the verification email
            await sendVerificationEmail(newUser.email, verificationToken);
        } catch (emailError) {
            // Log the email error, but don't stop the success response.
            // The user is created, but the email failed to send.
            console.error(`[Signup] User ${username} created, but email verification failed to send:`, emailError.message);
        }
        // --- END FIX ---

        // Send success response regardless of email outcome
        res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });

    } catch (e) {
        // This catch now primarily handles user creation errors
        if (e.code === 11000) {
            // Duplicate email
            return res.status(409).json({ message: "An account with that email already exists." });
        } else {
            // Pass other DB/validation errors to the main error handler
            return next(e);
        }
    }
};

module.exports.verifyEmailApi = async (req, res, next) => {
    try {
        const { token } = req.body; // Token comes from POST body
        if (!token) {
            return next(new ExpressError(400, "Verification token is missing."));
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ExpressError(404, "Invalid or expired verification token. Please try signing up again."));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Send JSON response instead of flashing/redirecting
        res.status(200).json({ message: "Email verified successfully!" });

    } catch (error) {
        console.error("Verification API Error:", error);
        next(new ExpressError(500, "Something went wrong during verification."));
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

module.exports.login = async (req, res) => {
    try {
        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        console.log('[Login] Tokens generated successfully');

        res.status(200).json({
            message: "Login successful!",
            user: req.user,
            accessToken: accessToken
        });
    } catch (error) {
        console.error('[Login] Error:', error);
        res.status(500).json({ message: "Login failed" });
    }
};

module.exports.logout = (req, res, next) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });

    res.status(200).json({ message: "Logged out successfully" });
};

module.exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    try {
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check token version (for revocation)
        if (decoded.version !== user.refreshTokenVersion) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('[Refresh Token] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.checkAuth = async (req, res) => {
    console.log(`[/api/check-auth] Handler Reached`);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[/api/check-auth] No token provided');
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        console.log('[/api/check-auth] Invalid token');
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        console.log(`[/api/check-auth] User found: ${user.username}`);
        res.status(200).json(user);
    } catch (error) {
        console.error('[/api/check-auth] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.toggleSavePin = async (req, res, next) => {
    const { pinId } = req.params;

    if (!req.user || !req.user._id) {
        console.error("[toggleSavePin] Error: User not found on request object.");
        return next(new ExpressError(401, "Authentication error: User not identified."));
    }

    const userId = req.user._id;

    try {
        console.log(`[toggleSavePin] User ${userId} toggling save for pin ${pinId}`);

        const [user, pin] = await Promise.all([
            User.findById(userId),
            Pin.findById(pinId)
        ]);

        if (!user) {
            console.error(`[toggleSavePin] User not found in DB: ${userId}`);
            return res.status(404).json({ message: "User not found." });
        }
        if (!pin) {
            console.warn(`[toggleSavePin] Pin not found: ${pinId}`);
            return res.status(404).json({ message: "Pin not found." });
        }

        const savedIndex = user.savedPins.findIndex(savedId => savedId.equals(pinId));
        let message;

        if (savedIndex > -1) {
            user.savedPins.splice(savedIndex, 1);
            message = "Pin unsaved successfully.";
            console.log(`[toggleSavePin] User ${userId} unsaved pin ${pinId}`);
        } else {
            user.savedPins.push(pinId);
            message = "Pin saved successfully.";
            console.log(`[toggleSavePin] User ${userId} saved pin ${pinId}`);
        }

        const updatedUser = await user.save();
        const updatedSavedPinIds = updatedUser.savedPins.map(id => id.toString());

        res.status(200).json({
            message,
            savedPins: updatedSavedPinIds
        });

    } catch (error) {
        console.error(`[toggleSavePin] CRITICAL ERROR for user ${userId}, pin ${pinId}:`, error);
        next(new ExpressError(500, `Could not update saved pins. Details: ${error.message}`));
    }
};

module.exports.getSavedPins = async (req, res, next) => {
    if (!req.user || !req.user._id) {
        console.error("[getSavedPins] Error: User not found on request object.");
        return next(new ExpressError(401, "Authentication error: User not identified."));
    }

    const userId = req.user._id;
    console.log(`[getSavedPins] Fetching saved pins for user: ${userId}`);

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.error(`[getSavedPins] User document not found in DB for ID: ${userId}`);
            return res.status(404).json({ message: "User not found." });
        }

        console.log(`[getSavedPins] User has ${user.savedPins?.length ?? 0} saved pin references.`);

        const populatedPins = await Pin.find({
            '_id': { $in: user.savedPins }
        }).sort({ _id: -1 })
            .populate({
                path: 'postedBy',
                select: 'username profileImage _id'
            });

        console.log(`[getSavedPins] Successfully populated ${populatedPins.length} pins.`);

        res.status(200).json(populatedPins || []);

    } catch (error) {
        console.error(`[getSavedPins] CRITICAL ERROR for user ${userId}:`, error);
        next(new ExpressError(500, `Server error fetching saved pins. Details: ${error.message}`));
    }
};

module.exports.deleteAccount = async (req, res, next) => {
    const userId = req.user._id;

    if (!userId) {
        return next(new ExpressError(401, "Not authorized."));
    }

    try {
        console.log(`[Delete Account] Starting deletion for user: ${req.user.username} (${userId})`);

        // 1. Find all pins created by this user
        const userPins = await Pin.find({ postedBy: userId });
        const pinIdsToDelete = userPins.map(p => p._id);

        if (userPins.length > 0) {
            // 2. Delete all images for those pins from Cloudinary
            const filenames = userPins
                .map(pin => pin.image && pin.image.filename)
                .filter(filename => filename); // Filter out any pins that might not have a filename

            if (filenames.length > 0) {
                console.log(`[Delete Account] Deleting ${filenames.length} images from Cloudinary...`);
                // Use delete_resources for batch deletion
                await cloudinary.api.delete_resources(filenames);
            }

            // 3. Delete all pins from the 'pins' collection
            console.log(`[Delete Account] Deleting ${userPins.length} pins from DB...`);
            await Pin.deleteMany({ postedBy: userId });
        }

        // 4. Remove these deleted pins from *all other users'* savedPins arrays
        if (pinIdsToDelete.length > 0) {
            console.log(`[Delete Account] Removing deleted pin IDs from all users' savedPins arrays...`);
            await User.updateMany(
                { savedPins: { $in: pinIdsToDelete } },
                { $pull: { savedPins: { $in: pinIdsToDelete } } }
            );
        }

        // 5. Delete the user document itself
        console.log(`[Delete Account] Deleting user document: ${req.user.username}`);
        await User.findByIdAndDelete(userId);

        // 6. Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });

        // 7. Send success response
        res.status(200).json({ message: "Account deleted successfully." });

    } catch (error) {
        console.error(`[Delete Account] Error deleting account for user ${userId}:`, error);
        next(new ExpressError(500, "Failed to delete account."));
    }
};

module.exports.getUserProfile = async (req, res, next) => {
    const { username } = req.params;

    const user = await User.findOne({ username })
        .select("username profileImage _id createdAt");

    if (!user) {
        throw new ExpressError(404, "User not found");
    }

    const boards = await Board.find({ owner: user._id })
        .populate({
            path: 'pins',
            select: 'image title',
            options: { limit: 3 }
        })
        .sort({ updatedAt: -1 });

    const createdPins = await Pin.find({ postedBy: user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        user,
        boards,
        createdPins
    });
};