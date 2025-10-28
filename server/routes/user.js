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
    // Log details RIGHT WHEN this specific request arrives
    console.log(`---\n[/api/check-auth] Handler Reached`);
    console.log(`[/api/check-auth] Session ID: ${req.sessionID}`);
    console.log(`[/api/check-auth] req.session.passport?.user value: ${req.session?.passport?.user}`);

    // Directly check req.user BEFORE calling isAuthenticated()
    const userObjectPresent = !!req.user;
    console.log(`[/api/check-auth] Is req.user object present?: ${userObjectPresent}`);
    if (userObjectPresent) {
        console.log(`[/api/check-auth] req.user ID: ${req.user.id}, Username: ${req.user.username}`);
    } else {
         console.log(`[/api/check-auth] req.user is NOT present.`);
    }

    // Now call isAuthenticated and log its result
    const isAuthenticatedResult = req.isAuthenticated();
    console.log(`[/api/check-auth] Result of req.isAuthenticated(): ${isAuthenticatedResult}`);
    console.log(`---`);

    if (isAuthenticatedResult && req.user) { // Double-check both
        res.status(200).json(req.user); // Send the user data found
    } else {
        // Send 401 if either check fails, indicating the request isn't properly authenticated *at this moment*
        res.status(401).json({ message: 'API check: Not authenticated' });
    }
});


module.exports = router;