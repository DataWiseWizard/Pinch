const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pinSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,

  },
  userId: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },

  // postedBy: {
  //   type: Schema.Types.objectId,
  //   ref: 'User'
  // },
  // save: {
  //   type: Array,
  // },
  // comments: [
  //       {
  //           type: Schema.Types.ObjectId,
  //           ref: "Review",
  //       },
  //   ],
});

const Pin = mongoose.model('Pin', pinSchema);



module.exports = Pin;