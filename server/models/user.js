const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    // Primary identifier, must be unique.
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Required display name.
    displayName: {
        type: String,
        required: true
    },
    // Optional: Only exists for local users.
    password: {
        type: String,
        required: false // Not required
    },
    // Optional: Only exists for Google users.
    googleId: {
        type: String,
        required: false // Not required
    },
    // Optional: Can come from Google.
    profileImage: {
        type: String,
        required: false
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

module.exports = User;