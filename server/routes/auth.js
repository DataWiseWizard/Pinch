const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

const clientURL = process.env.CLIENT_URL;

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${clientURL}/login`
}), (req, res) => {
    req.flash("success", "Successfully logged in with Google!");
    res.redirect(clientURL);
});

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'YOUR_FRONTEND_URL'}/login`
}), (req, res) => {
    // --- ADD LOGGING ---
    console.log('Google Callback: Authentication successful.');
    console.log('Google Callback: req.isAuthenticated():', req.isAuthenticated());
    console.log('Google Callback: req.user:', req.user);
    console.log('Google Callback: Session ID:', req.sessionID);
    console.log('Google Callback: Redirecting to:', clientURL);
    // --- END LOGGING ---

    req.flash("success", "Successfully logged in with Google!");

    res.redirect(clientURL); // Redirect to the verified CLIENT_URL
});

module.exports = router;
