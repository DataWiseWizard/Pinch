const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pins: {
        type: [Schema.Types.ObjectId],
        ref: 'Pin',
        default: []
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);