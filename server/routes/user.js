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
    passport.authenticate("local", {
        session: false, // Don't use sessions with JWT
        failureRedirect: '/login',
        failureFlash: true
    }),
    userController.login
);

router.get("/logout", userController.logout);

router.post('/api/refresh', userController.refreshToken);

// Check auth endpoint
router.get('/api/check-auth', userController.checkAuth);

router.put('/pins/:pinId/save',
    isLoggedIn,
    wrapAsync(userController.toggleSavePin)
);

router.get('/pins/saved',
    isLoggedIn,
    wrapAsync(userController.getSavedPins)
);

router.get("/verify-email", wrapAsync(userController.verifyEmail));

module.exports = router;