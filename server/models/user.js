const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    // Primary identifier, must be unique.
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Required display name.
    username: {
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
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
        required: false
    },
    boards: {},
    // savedPins: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Pin'
    // }],
    refreshTokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

module.exports = User;