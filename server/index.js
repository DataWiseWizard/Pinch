const path = require("path");
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    console.log(process.env);
};

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require(path.join(__dirname, "utils", "ExpressError.js"));
const mongoDbUrl = process.env.ATLASDB_URL;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");

const pinRouter = require(path.join(__dirname, "routes", "pin.js"));

const authRouter = require(path.join(__dirname, "routes", "auth.js")); // New route for Google

const userRouter = require(path.join(__dirname, "routes", "user.js"));

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    })


async function main() {
    await mongoose.connect(mongoDbUrl);
}


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const clientURL = process.env.CLIENT_URL;
const corsOptions = {
  origin: clientURL, // Allow requests ONLY from your frontend URL
  credentials: true // Important for sessions/cookies
};
app.use(cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, '../client/dist')));

const store = MongoStore.create({
    mongoUrl: mongoDbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SEESION STORE.", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Standardized cookie expiration
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}



app.use(session(sessionOptions));
app.use(flash());
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

app.use(express.json()); // <-- Add this to parse JSON request bodies

app.use(express.urlencoded({ extended: true }));

app.get('*', (req, res, next) => {
  // If the request is for an API endpoint, skip the fallback
  if (req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/pins') ||
      req.originalUrl.startsWith('/auth') ||
      req.originalUrl.startsWith('/login') || // Add other server routes if necessary
      req.originalUrl.startsWith('/signup') ||
      req.originalUrl.startsWith('/logout') ||
      req.originalUrl.startsWith('/verify-email') ) {
     return next();
  }
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html')); // Adjust path if needed
});

app.get("/", (req, res) => {
    res.redirect("/pins");
})

app.use("/", userRouter);
app.use("/pins", pinRouter);
app.use("/auth", authRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!")); // Standardize to ExpressError
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    console.error("--- Central Error Handler ---"); // Log that it's being used
    console.error("Status Code:", statusCode);
    console.error("Message:", message);
    console.error("Stack:", err.stack); // *** Ensure stack trace is logged ***
    console.error("--- End Error ---");
    // Ensure you're sending a JSON response for API routes, or render for EJS views
    // Check if the request likely expects JSON (common for React frontends)
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/pins') || req.originalUrl.startsWith('/auth') || req.accepts('json')) {
       res.status(statusCode).json({ message: message }); // Send JSON error
    } else {
        // Fallback for non-API routes (if any still use EJS rendering for errors)
        res.status(statusCode).render("error.ejs", { err }); // Pass err object to template
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
