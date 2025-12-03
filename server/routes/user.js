const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, validateBody } = require("../middlewares.js");
const { userSignupSchema } = require('../validation/schemas');
const multer = require('multer');
const { storage } = require("../config/cloudConfig.js");
const upload = multer({ storage });
const userController = require("../controllers/user.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(validateBody(userSignupSchema), wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        (req, res, next) => {
            passport.authenticate("local", { session: false }, (err, user, info) => {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({ message: info.message || "Invalid username or password." });
                }
                req.user = user;
                next();
            })(req, res, next);
        },
        userController.login
    );

router.get("/logout", userController.logout);

router.post('/api/refresh', userController.refreshToken);

router.get('/api/check-auth', userController.checkAuth);

router.put(
    "/profile", 
    isLoggedIn, 
    upload.single('profileImage'),
    wrapAsync(userController.updateProfile)
);

router.delete(
    "/profile",
    isLoggedIn,
    wrapAsync(userController.deleteUser) 
);


router.delete(
    "/api/user/delete",
    isLoggedIn,
    wrapAsync(userController.deleteAccount)
);

router.post("/api/verify-email", wrapAsync(userController.verifyEmailApi));

router.put('/pins/:pinId/save',
    isLoggedIn,
    wrapAsync(userController.toggleSavePin)
);

router.get('/pins/saved',
    isLoggedIn,
    wrapAsync(userController.getSavedPins)
);

router.get("/api/users/:username", wrapAsync(userController.getUserProfile));

module.exports = router;