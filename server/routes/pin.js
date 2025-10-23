const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validatePin } = require('../middlewares.js');

const pinController = require("../controllers/pins.js");
const multer = require('multer');
const { storage } = require("../config/cloudConfig.js");
const upload = multer({ storage });


router.get("/", wrapAsync(pinController.index));



router.get("/new", isLoggedIn, pinController.renderNewForm);

router.get("/user/:userId", isLoggedIn, wrapAsync(pinController.getUserPins));

router.get("/:id", wrapAsync(pinController.showPin));

router.post("/",
  isLoggedIn,
  upload.single("pin[image]"),
  // validatePin,
  wrapAsync(pinController.createPin)
)

router.delete("/:id",
  isLoggedIn, 
  wrapAsync(pinController.deletePin)
);



module.exports = router;