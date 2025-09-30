const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pinSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
  },
  image: {
    url: String, // Store URL from Cloudinary
    filename: String // Store filename from Cloudinary
  },
  category: {
    type: String,
  },
  // This is the correct way to link to the User model
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
});

const Pin = mongoose.model('Pin', pinSchema);

module.exports = Pin;