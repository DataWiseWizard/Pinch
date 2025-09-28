const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), (req, res) => {
    // Successful authentication
    req.flash("success", "Successfully logged in with Google!");
    const redirectUrl = req.session.redirectUrl || '/pins';
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
});

module.exports = router;
