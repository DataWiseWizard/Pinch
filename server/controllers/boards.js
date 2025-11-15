// server/controllers/board.js

const Board = require("../models/board");
const User = require("../models/user");
const Pin = require("../models/pin");
const ExpressError = require("../utils/ExpressError");


module.exports.getBoardsForUser = async (req, res) => {
    const boards = await Board.find({ owner: req.user._id });
    if (!boards) {
        return res.status(200).json();
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
        res.status(200).json({ message: "Pin added to board", board });
    } else {
        res.status(200).json({ message: "Pin is already on this board", board });
    }
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