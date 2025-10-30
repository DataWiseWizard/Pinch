const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const clientURL = process.env.CLIENT_URL;


router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false // Don't use sessions
}));

router.get('/google/callback', 
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${clientURL}/login?error=auth_failed`
    }), 
    (req, res) => {
        console.log('Google Callback: Authentication successful.');
        console.log('User:', req.user);
        
        try {
            // Generate tokens
            const accessToken = generateAccessToken(req.user);
            const refreshToken = generateRefreshToken(req.user);
            
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            
            console.log('[Google Callback] Tokens generated. Redirecting with access token...');
            
            // Redirect to frontend with access token
            res.redirect(`${clientURL}/auth/callback?token=${accessToken}`);
        } catch (error) {
            console.error('[Google Callback] Error:', error);
            res.redirect(`${clientURL}/login?error=token_generation_failed`);
        }
    }
);

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
