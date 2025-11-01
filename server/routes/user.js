const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middlewares.js");

const userController = require("../controllers/user.js");

router
.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    // Use a custom callback for passport.authenticate
    (req, res, next) => {
        passport.authenticate("local", { session: false }, (err, user, info) => {
            // Handle server errors
            if (err) {
                return next(err);
            }
            // Handle authentication failure
            if (!user) {
                // Send a 401 Unauthorized status with a JSON error message
                return res.status(401).json({ message: info.message || "Invalid username or password." });
            }
            // Authentication succeeded. Attach user to req and call the next middleware (userController.login)
            req.user = user;
            next();
        })(req, res, next);
    },
    userController.login // This is only called if authentication succeeds
);

router.get("/logout", userController.logout);

router.post('/api/refresh', userController.refreshToken);

// Check auth endpoint
router.get('/api/check-auth', userController.checkAuth);

router.delete(
    "/api/user/delete",
    isLoggedIn, // Protects the route, ensuring req.user is populated
    wrapAsync(userController.deleteAccount)
);

router.post("/api/verify-email", wrapAsync(userController.verifyEmailApi));

router.put('/pins/:pinId/save',
    isLoggedIn,
    wrapAsync(userController.toggleSavePin)
);

router.get('/pins/saved',
    isLoggedIn,
    wrapAsync(userController.getSavedPins)
);


module.exports = router;