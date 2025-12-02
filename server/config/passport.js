const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/Token');
const { sendVerificationEmail } = require('../utils/Email');

// This function determines what user data to store in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// This function retrieves the full user data from the session
// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (err) {
//         done(err, null);
//     }
// });

passport.deserializeUser(async (id, done) => {
    // --- ADD LOGGING ---
    console.log(`[deserializeUser] Attempting to deserialize user with ID: ${id}`);
    // --- END LOGGING ---
    try {
        const user = await User.findById(id);
        // --- ADD LOGGING ---
        if (!user) {
            console.error(`[deserializeUser] User not found in DB for ID: ${id}`);
            return done(null, false); // Important: Indicate user not found
        }
        console.log(`[deserializeUser] Successfully found user: ${user.username}`);
        // --- END LOGGING ---
        done(null, user); // Pass the found user object
    } catch (err) {
        // --- ADD LOGGING ---
        console.error(`[deserializeUser] Error during User.findById for ID ${id}:`, err);
        // --- END LOGGING ---
        done(err, null);
    }
});


// --- LOCAL STRATEGY for username/password ---
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.isVerified && user.password) {
            return done(null, false, { message: 'Please verify your email before logging in.' });
        }

        if (!user.password) { // User signed up with Google and has no password
            return done(null, false, { message: 'Please log in with Google.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

const backendUrl = process.env.NODE_ENV === 'production'
    ? process.env.BASE_URL
    : 'http://localhost:5000';


// --- GOOGLE OAUTH STRATEGY ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/auth/google/callback`
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                if (!user.isVerified) {
                    // Optionally, resend verification email here
                    return done(null, false, { message: 'This account is not verified. Please check your email.' });
                }
                return done(null, user); // User found and is verified, log them in
            } else {
                // Check if user exists with that email
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    // User exists but logged in locally, link their googleId
                    user.googleId = profile.id;
                    user.profileImage = user.profileImage || profile.photos[0].value;
                    // If they are linking to an unverified local account, don't log them in.
                    if (!user.isVerified) {
                        await user.save();
                        return done(null, false, { message: 'Account found. Please verify your email to log in.' });
                    }
                    await user.save();
                    return done(null, user);
                }

                // If no user, create a new one, but DO NOT log them in.
                // Force them to verify their email first.
                const verificationToken = generateToken();
                const newUser = new User({
                    googleId: profile.id,
                    username: profile.displayName, // or profile.emails[0].value.split('@')[0]
                    email: profile.emails[0].value,
                    profileImage: profile.photos[0].value,
                    isVerified: false, // <-- SET TO FALSE
                    verificationToken: verificationToken, // <-- ADD TOKEN
                    verificationTokenExpires: Date.now() + 3600000 // 1 hour
                });
                await newUser.save();
                // Try to send the verification email
                try {
                    await sendVerificationEmail(newUser.email, verificationToken);
                } catch (emailError) {
                    console.error(`[Google Strategy] Failed to send verification email to ${newUser.email}:`, emailError);
                    // Don't block the flow, just log the error.
                }

                // --- DO NOT LOG THEM IN ---
                // Instead, return a failure message telling them to verify.
                return done(null, false, { message: 'Account created. Please check your email to verify your account before logging in.' });
            }
        } catch (err) {
            return done(err, null);
        }
    }));