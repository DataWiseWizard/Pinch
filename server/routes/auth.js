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

module.exports = router;
