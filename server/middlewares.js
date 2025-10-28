const { pinSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
// const Pin = require("./models/pin.js");


module.exports.isLoggedIn = (req, res, next) => {
    // --- ADD MORE DETAILED LOGGING ---
    console.log(`---\n[isLoggedIn] Check initiated for: ${req.method} ${req.originalUrl}`);
    console.log(`[isLoggedIn] Session ID: ${req.sessionID}`);

    // Check if req.user exists *immediately* before isAuthenticated()
    const userExists = !!req.user;
    const passportSessionUser = req.session?.passport?.user;
    console.log(`[isLoggedIn] req.user exists? ${userExists}`);
    if(userExists) {
        console.log(`[isLoggedIn] req.user details: { id: ${req.user._id}, username: ${req.user.username} }`);
    }
    console.log(`[isLoggedIn] req.session.passport.user: ${passportSessionUser}`);

    // Call isAuthenticated() and log its result
    const isAuthenticatedResult = req.isAuthenticated();
    console.log(`[isLoggedIn] req.isAuthenticated() returned: ${isAuthenticatedResult}`);
    // --- END LOGGING ---

    if (!isAuthenticatedResult) { // Use the stored result for clarity
        console.error(`[isLoggedIn] Authentication check failed for ${req.originalUrl}. Sending 401.`);
        req.session.redirectUrl = req.originalUrl;
        // Use a distinct message to confirm this exact spot is failing
        return res.status(401).json({ message: "Middleware Auth Check Failed: You must be logged in." });
    }

    console.log(`[isLoggedIn] Authentication successful for ${req.originalUrl}. Calling next().`);
    next(); // Proceed to the actual route handler
};

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