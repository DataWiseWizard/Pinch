const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validatePin } = require('../middlewares.js');

const pinController = require("../controllers/pins.js");
const multer = require('multer');
const { storage } = require("../config/cloudConfig.js");
const upload = multer({ storage });

router.get("/", wrapAsync(pinController.index));
router.post("/",
  isLoggedIn,
  upload.single("pin[image]"),
  validatePin,
  wrapAsync(pinController.createPin)
);

router.get("/new", isLoggedIn, pinController.renderNewForm);



// router.get("/:id", wrapAsync(pinController.showPin));


module.exports = router;