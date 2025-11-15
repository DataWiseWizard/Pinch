const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pin: {
        type: Schema.Types.ObjectId,
        ref: 'Pin',
        required: true
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null 
    },
    replies: {},
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);