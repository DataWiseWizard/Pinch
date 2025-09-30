const { pinSchema} = require("./Schema.js");
const ExpressError = require("./utils/expressError.js");
const Pin = require("./models/pin.js");


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be looged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(!req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validatePin = (req,res,next) => {
    let {error} = pinSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(".");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
