const { pinSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
// const Pin = require("./models/pin.js");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        return res.status(401).json({ message: "You must be logged in to perform this action." });
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (!req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validatePin = (req, res, next) => {

    const { error } = pinSchema.validate(req.body);
    if (error) {

        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};