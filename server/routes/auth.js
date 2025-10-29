const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

const clientURL = process.env.CLIENT_URL;


router.get('/google/callback', 
    passport.authenticate('google', {
        failureRedirect: `${clientURL}/login?error=auth_failed`
    }), 
    (req, res) => {
        console.log('Google Callback: Authentication successful.');
        console.log('User:', req.user);
        
        req.session.save((err) => {
            if (err) {
                console.error('[Google Callback] Session save error:', err);
                return res.redirect(`${clientURL}/login?error=session_error`);
            }
            
            console.log('[Google Callback] Session saved. Redirecting...');
            res.redirect(clientURL);
        });
    }
);

module.exports = router;
