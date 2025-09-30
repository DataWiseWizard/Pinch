const User = require("../models/user");
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

        
        req.flash("success", "Registration successful! Please check your email to verify your account.");
        res.redirect("/login");
    } catch (e) {
        if (e.code === 11000) {
            req.flash("error", "An account with that email already exists.");
        } else {
            req.flash("error", e.message);
        }        
        res.redirect("/signup");
    }
};


module.exports.verifyEmail = async (req, res) => {
    try {
        const {token} = req.query;
        if (!token) {
            req.flash("error", "Verification failed. Token is missing.");
            return res.redirect("/login");
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now()}
        })

        if(!user) {
            req.flash("error", "Invalid or expired verification token.");
            return res.redirect("/login");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        req.login(user, (err) => {{
            if (err) {return next(err);}
            req.flash("success", "Email verified successfully! You are now logged in.");
            res.redirect("/pins");
        }})

    } catch (error) {
        req.flash("error", "Something went wrong during verification.");
        res.redirect("/login");
    }
}


module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/pins";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "You are logged out now!");
        res.redirect("/pins");
    });
};