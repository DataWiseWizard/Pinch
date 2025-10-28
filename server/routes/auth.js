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

    req.session.save((err) => {
        if (err) {
            console.error('[Google Callback] Error saving session:', err);
            // If session save fails, don't redirect, pass error to handler
            return next(err);
        }
        // --- LOG AFTER SAVE ---
        console.log('[Google Callback] Session saved successfully.');
        // Check session content *after* save attempt (for debugging)
        console.log('[Google Callback] req.session.passport?.user AFTER save:', req.session?.passport?.user);
        console.log('[Google Callback] Redirecting to:', clientURL);
        // --- END LOGGING ---

        res.redirect(clientURL); // Redirect ONLY after successful save
    });
});

module.exports = router;
