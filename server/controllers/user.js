const User = require("../models/user");
const Pin = require("../models/pin");
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/Token');
const { sendVerificationEmail } = require('../utils/Email');

module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = generateToken();

        const newUser = new User({ email, username, displayName: username, password: hashedPassword, verificationToken: verificationToken, verificationTokenExpires: Date.now() + 3600000 });
        await newUser.save();
        await sendVerificationEmail(newUser.email, verificationToken);


        res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ message: "An account with that email already exists." });
        } else {
            return res.status(400).json({ message: e.message });
        }
    }
};

module.exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            req.flash("error", "Verification failed. Token is missing.");
            return res.redirect("/login");
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        })

        if (!user) {
            req.flash("error", "Invalid or expired verification token.");
            return res.redirect("/login");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        req.login(user, (err) => {
            {
                if (err) { return next(err); }
                req.flash("success", "Email verified successfully! You are now logged in.");
                res.redirect("/pins");
            }
        })

    } catch (error) {
        req.flash("error", "Something went wrong during verification.");
        res.redirect("/login");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

module.exports.login = async (req, res) => {
    // We no longer need to flash and redirect from the backend for API calls
    res.status(200).json({ message: "Login successful!", user: req.user });
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "You are logged out now!");
        res.redirect("/pins");
    });
};

module.exports.toggleSavePin = async (req, res) => {
    const { pinId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const pin = await Pin.findById(pinId);

    if (!pin) {
        return res.status(404).json({ message: "Pin not found." });
    }
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    const savedIndex = user.savedPins.indexOf(pinId);

    let message;
    let updatedSavedPins;

    if (savedIndex > -1) {
        user.savedPins.splice(savedIndex, 1);
        message = "Pin unsaved successfully.";
        updatedSavedPins = user.savedPins;
    } else {
        user.savedPins.push(pinId);
        message = "Pin saved successfully.";
        updatedSavedPins = user.savedPins;
    }

    await user.save();
    res.status(200).json({ message, savedPins: updatedSavedPins });
};

module.exports.getSavedPins = async (req, res) => {
    const userId = req.user._id;
    console.log(`Fetching saved pins for user: ${userId}`);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch pins that exist in the Pin collection
        const savedPins = await Pin.find({
            '_id': { $in: user.savedPins }
        });

        console.log(`Found ${savedPins.length} saved pins for user ${userId}`);
        res.status(200).json(savedPins);

    } catch (error) {
        console.error(`Error fetching saved pins for user ${userId}:`, error);
        res.status(500).json({ message: "Internal server error while fetching saved pins." });
    }
};