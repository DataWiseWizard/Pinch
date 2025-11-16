const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isCommentAuthor } = require('../middlewares.js');
const commentController = require("../controllers/comments.js");

router.get("/pins/:pinId/comments", 
    wrapAsync(commentController.getCommentsForPin)
);

router.post("/pins/:pinId/comments", 
    isLoggedIn, 
    wrapAsync(commentController.createComment)
);

router.post("/comments/:commentId/reply", 
    isLoggedIn, 
    wrapAsync(commentController.createReply)
);

router.put("/comments/:commentId", 
    isLoggedIn, 
    isCommentAuthor, 
    wrapAsync(commentController.updateComment)
);

router.delete("/comments/:commentId", 
    isLoggedIn, 
    isCommentAuthor, 
    wrapAsync(commentController.deleteComment)
);

module.exports = router;