const path = require("path");
const express = require('express');

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require(path.join(__dirname, "utils", "ExpressError.js"));
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require(path.join(__dirname, "models", "user.js"));

const userRouter = require(path.join(__dirname, "routes", "user.js"));

const dbUrl = 'mongodb://localhost:27017/chonku';

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    })


async function main() {
    await mongoose.connect(dbUrl);
}


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl, // Use dbUrl from environment variable
    crypto: {
        secret: process.env.SECRET || 'thisshouldbeabettersecret!', // Use environment variable for secret
    },
    touchAfter: 24 * 3600,
})

store.on("error", (err) => { // Added err parameter for consistency
    console.log("ERROR in MONGO SESSION STORE.", err);
})


const sessionOptions = {
    store,
    secret: process.env.SECRET, // Use environment variable for secret
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Standardized cookie expiration
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    // res.locals.currUser = req.user;
    next();
});


app.get("/", (req,res) => {
    res.redirect("/pins");
})

app.use("/", userRouter);

app.all("/", (req, res, next) => {
    next(new ExpressError(404, "Page not found!")); // Standardize to ExpressError
})

app.use((err, req, res, next) => { // Standardized error handling middleware
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err }); // Pass err object to template
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
