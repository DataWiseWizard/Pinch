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
    url: String, 
    filename: String 
  },
  tags: {
    type: [String], 
    index: true 
  },
  embedding: {
    type: [Number], // e.g., [0.12, -0.45, 0.88, ...]
    select: false   // Optimization: Don't fetch this huge array unless explicitly asked
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
}, { timestamps: true });

pinSchema.index({ title: 'text', tags: 'text' });

const Pin = mongoose.model('Pin', pinSchema);
module.exports = Pin;