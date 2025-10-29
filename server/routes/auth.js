const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/auth/google/failure'
    }), 
    (req, res) => {
        console.log('Google Callback: Authentication successful.');
        console.log('User:', req.user);
        
        req.session.save((err) => {
            if (err) {
                console.error('[Google Callback] Session save error:', err);
                return res.redirect('/auth/google/failure');
            }
            
            console.log('[Google Callback] Session saved successfully.');
            // Redirect to success page that will close popup
            res.redirect('/auth/google/success');
        });
    }
);

// Success page - sends message to parent window then closes
router.get('/google/success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Successful</title>
        </head>
        <body>
            <script>
                // Send success message to parent window (your React app)
                if (window.opener) {
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '${process.env.CLIENT_URL}');
                    window.close();
                } else {
                    // Fallback if no opener
                    window.location.href = '${process.env.CLIENT_URL}';
                }
            </script>
            <p>Login successful! This window should close automatically...</p>
        </body>
        </html>
    `);
});

// Failure page
router.get('/google/failure', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Failed</title>
        </head>
        <body>
            <script>
                if (window.opener) {
                    window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE' }, '${process.env.CLIENT_URL}');
                    window.close();
                } else {
                    window.location.href = '${process.env.CLIENT_URL}/login?error=auth_failed';
                }
            </script>
            <p>Login failed. This window should close automatically...</p>
        </body>
        </html>
    `);
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
