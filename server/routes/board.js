const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require('../middlewares.js');
const boardController = require("../controllers/boards.js");

router.use(isLoggedIn);

// GET /api/boards/myboards
// (Gets all boards for the currently logged-in user)
router.get("/myboards", wrapAsync(boardController.getBoardsForUser));

// (Creates a new board)
router.post("/", wrapAsync(boardController.createBoard));

// PUT /api/boards/:boardId/add-pin
// (Adds a pin to a specific board)
router.put("/:boardId/add-pin", wrapAsync(boardController.addPinToBoard));

router.get("/:boardId", wrapAsync(boardController.getBoardDetails));

router.delete("/:boardId", wrapAsync(boardController.deleteBoard));

router.delete("/:boardId/pins/:pinId", wrapAsync(boardController.removePinFromBoard));

module.exports = router;