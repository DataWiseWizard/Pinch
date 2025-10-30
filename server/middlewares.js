const { pinSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { verifyAccessToken } = require('./utils/jwt');
const User = require('./models/user.js');

// const Pin = require("./models/pin.js");


module.exports.isLoggedIn = async (req, res, next) => {
    console.log(`[isLoggedIn] Check for: ${req.method} ${req.originalUrl}`);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[isLoggedIn] No token provided');
        return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
        console.error('[isLoggedIn] Invalid or expired token');
        return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }

    try {
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }
        
        req.user = user;
        console.log(`[isLoggedIn] User authenticated: ${user.username}`);
        next();
    } catch (error) {
        console.error('[isLoggedIn] Database error:', error);
        res.status(500).json({ message: "Authentication error." });
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) {
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