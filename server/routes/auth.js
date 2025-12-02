const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const clientURL = process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173';

console.log('[Auth Routes] CLIENT_URL is set to:', clientURL);

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false // Don't use sessions
}));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        session: false,
        // We don't use failureRedirect, we handle failure manually
    }, (err, user, info) => {
        
        // Handle server errors
        if (err) {
            return next(err);
        }
        
        // --- Handle authentication failure (e.g., user not verified) ---
        if (!user) {
            const errorMessage = info.message || 'Authentication failed. Please try again.';
            // Redirect to login page with the specific error message
            console.log(`[Google Callback] Auth failed: ${errorMessage}`);
            return res.redirect(`${clientURL}/login?error=${encodeURIComponent(errorMessage)}`);
        }

        // --- Handle authentication success ---
        console.log('Google Callback: Authentication successful.');
        console.log('User:', user); // Use 'user' object from callback
        
        try {
            // Generate tokens for the 'user' object returned by passport
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            
            // CONSTRUCT REDIRECT URL
            const redirectURL = `${clientURL}/auth/callback?token=${accessToken}`;
            
            // ADD LOGGING
            console.log('[Google Callback] CLIENT_URL:', clientURL);
            console.log('[Google Callback] Redirecting to:', redirectURL);            
            // Redirect to frontend with access token
            res.redirect(redirectURL);
        } catch (error) {
            console.error('[Google Callback] Error:', error);
            res.redirect(`${clientURL}/login?error=token_generation_failed`);
        }
    })(req, res, next); // Don't forget to call the middleware
});

module.exports = router;


// const express = require('express');
// const passport = require('passport');
// const router = express.Router();

// router.get('/google', passport.authenticate('google', {
//     scope: ['profile', 'email']
// }));

// const clientURL = process.env.CLIENT_URL;


// router.get('/google/callback', 
//     passport.authenticate('google', {
//         failureRedirect: `${clientURL}/login?error=auth_failed`
//     }), 
//     (req, res) => {
//         console.log('Google Callback: Authentication successful.');
//         console.log('User:', req.user);
        
//         req.session.save((err) => {
//             if (err) {
//                 console.error('[Google Callback] Session save error:', err);
//                 return res.redirect(`${clientURL}/login?error=session_error`);
//             }
            
//             console.log('[Google Callback] Session saved. Redirecting...');
//             res.redirect(clientURL);
//         });
//     }
// );

// module.exports = router;
