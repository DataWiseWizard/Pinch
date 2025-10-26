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
        failureRedirect: '/login',
        failureFlash: true
    }),
    userController.login
);

router.get("/logout", userController.logout);

router.put('/pins/:pinId/save',
    isLoggedIn,
    wrapAsync(userController.toggleSavePin)
);

router.get('/pins/saved',
    isLoggedIn,
    wrapAsync(userController.getSavedPins)
);


router.get("/verify-email", wrapAsync(userController.verifyEmail));

router.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});


module.exports = router;