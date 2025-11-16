const Comment = require("../models/comment");
const Pin = require("../models/pin");
const ExpressError = require("../utils/ExpressError");


module.exports.getCommentsForPin = async (req, res) => {
    const { pinId } = req.params;

    const comments = await Comment.find({ pin: pinId })
        .populate("author", "username profileImage _id")
        .sort({ createdAt: 'asc' });

    if (!comments) {
        return res.status(200).json([]);
    }

    res.status(200).json(comments);
};


module.exports.createComment = async (req, res) => {
    const { pinId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ExpressError(400, "Comment content is required.");
    }

    const pin = await Pin.findById(pinId);
    if (!pin) {
        throw new ExpressError(404, "Pin not found.");
    }

    const newComment = new Comment({
        content,
        author: req.user._id,
        pin: pinId,
        parentComment: null
    });

    await newComment.save();

    const populatedComment = await newComment.populate("author", "username profileImage _id");

    res.status(201).json(populatedComment);
};


module.exports.createReply = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ExpressError(400, "Reply content is required.");
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
        throw new ExpressError(404, "Parent comment not found.");
    }

    const newReply = new Comment({
        content,
        author: req.user._id,
        pin: parentComment.pin,
        parentComment: parentComment._id
    });

    await newReply.save();

    const populatedReply = await newReply.populate("author", "username profileImage _id");

    res.status(201).json(populatedReply);
};


module.exports.updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ExpressError(400, "Comment content is required for update.");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content, updatedAt: Date.now() },
        { new: true }
    ).populate("author", "username profileImage _id");

    if (!updatedComment) {
        throw new ExpressError(404, "Comment not found for update.");
    }

    res.status(200).json(updatedComment);
};


module.exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ExpressError(404, "Comment not found.");
    }

    const replyCount = await Comment.countDocuments({ parentComment: commentId });

    if (replyCount > 0) {
        comment.content = "[deleted]";
        comment.author = null;
        await comment.save();

        const softDeletedComment = await comment.populate({
            path: "author",
            select: "username profileImage _id" 
        });

        res.status(200).json({ message: "Comment (soft) deleted to preserve replies.", comment: softDeletedComment });

    } else {
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted successfully.", commentId: commentId });
    }
};