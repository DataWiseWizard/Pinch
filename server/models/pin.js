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
    url: String, // Correctly defined as an object property
    filename: String 
  },
  // category: {
  //   type: String,
  // },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // uploadedAt: {
  //   type: Date,
  //   default: Date.now
  // },
}, { timestamps: true });

const Pin = mongoose.model('Pin', pinSchema);
module.exports = Pin;