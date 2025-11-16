const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require('../middlewares.js');
const boardController = require("../controllers/boards.js");

router.use(isLoggedIn);

router.get("/myboards", wrapAsync(boardController.getBoardsForUser));

router.post("/", wrapAsync(boardController.createBoard));

router.put("/:boardId/add-pin", wrapAsync(boardController.addPinToBoard));

router.get("/:boardId", wrapAsync(boardController.getBoardDetails));

router.delete("/:boardId", wrapAsync(boardController.deleteBoard));

router.delete("/:boardId/pins/:pinId", wrapAsync(boardController.removePinFromBoard));

module.exports = router;