const Board = require("../models/board");
const User = require("../models/user");
const Pin = require("../models/pin");
const ExpressError = require("../utils/ExpressError");
const { updateUserInterests } = require("../utils/signals");

module.exports.getBoardsForUser = async (req, res) => {
    const { pinId } = req.query;
    const boards = await Board.find({ owner: req.user._id })
        .populate({
            path: 'pins',
            select: 'image',
            options: {
                sort: { createdAt: -1 },
                limit: 3
            }
        })
        .sort({ updatedAt: -1 });
    if (!boards) {
        return res.status(200).json();
    }
    if (pinId) {
        const boardsWithSaveStatus = boards.map(board => {
            const boardObj = board.toObject();
            const isPinSaved = board.pins.some(p => p.equals(pinId));
            boardObj.isPinSaved = isPinSaved;
            return boardObj;
        });
        return res.status(200).json(boardsWithSaveStatus);
    }
    res.status(200).json(boards);
};


module.exports.createBoard = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        throw new ExpressError(400, "Board name is required");
    }

    const newBoard = new Board({
        name,
        description,
        owner: req.user._id
    });

    await newBoard.save();


    const user = await User.findById(req.user._id);
    user.boards.push(newBoard._id);
    await user.save();
    res.status(201).json(newBoard);
};


module.exports.addPinToBoard = async (req, res) => {
    const { boardId } = req.params;
    const { pinId } = req.body;

    if (!pinId) {
        throw new ExpressError(400, "Pin ID is required in the request body");
    }

    const [board, pin] = await Promise.all([
        Board.findById(boardId),
        Pin.findById(pinId)
    ]);

    if (!board) throw new ExpressError(404, "Board not found");
    if (!pin) throw new ExpressError(404, "Pin not found");

    if (!board.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to modify this board");
    }

    if (!board.pins.includes(pinId)) {
        board.pins.push(pinId);
        await board.save();
        if (pin.tags && pin.tags.length > 0) {
            // +5 Points for saving to a board
            updateUserInterests(req.user._id, pin.tags, 5);
        }
        res.status(200).json({ message: "Pin added to board", board });
    } else {
        res.status(200).json({ message: "Pin is already on this board", board });
    }
};

module.exports.removePinFromBoard = async (req, res) => {
    const { boardId, pinId } = req.params;

    const board = await Board.findById(boardId);

    if (!board) throw new ExpressError(404, "Board not found");

    if (!board.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to modify this board");
    }
    await board.updateOne({ $pull: { pins: pinId } });

    res.status(200).json({ message: "Pin removed from board" });
};

module.exports.getBoardDetails = async (req, res) => {
    const { boardId } = req.params;
    const board = await Board.findById(boardId).populate({
        path: 'pins',
        model: 'Pin',
        populate: {
            path: 'postedBy',
            model: 'User',
            select: 'username profileImage'
        }
    });

    if (!board) {
        throw new ExpressError(404, "Board not found");
    }

    if (!board.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to view this board");
    }

    res.status(200).json(board);
};

module.exports.deleteBoard = async (req, res) => {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) throw new ExpressError(404, "Board not found");

    if (!board.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to delete this board");
    }

    await User.findByIdAndUpdate(req.user._id, { $pull: { boards: boardId } });

    await Board.findByIdAndDelete(boardId);

    res.status(200).json({ message: "Board deleted successfully" });
};