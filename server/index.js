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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (clientURL === origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // ✅ Critical
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));
app.set('trust proxy', 1);
app.use(express.json());
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
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Standardized cookie expiration
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Conditional
        path: "/"
    },
}

console.log("Session Options Being Applied:", JSON.stringify(sessionOptions, (key, value) => {
    if (key === 'secret') return '[REDACTED]';
    if (key === 'store') return '[MongoStore Instance]';
    return value;
}, 2));

app.use(session(sessionOptions));
app.use(flash());
require('./config/passport');
app.options('*', cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

app.use(express.json()); // <-- Add this to parse JSON request bodies

app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    res.redirect("/pins");
})

app.use("/", userRouter);
app.use("/pins", pinRouter);
app.use("/auth", authRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!")); // Standardize to ExpressError
})

app.get('*', (req, res, next) => {
    // If the request is for an API endpoint, skip the fallback
    if (req.originalUrl.startsWith('/api') ||
        req.originalUrl.startsWith('/pins') ||
        req.originalUrl.startsWith('/auth') ||
        req.originalUrl.startsWith('/login') || // Add other server routes if necessary
        req.originalUrl.startsWith('/signup') ||
        req.originalUrl.startsWith('/logout') ||
        req.originalUrl.startsWith('/verify-email')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html')); // Adjust path if needed
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    console.error("--- Central Error Handler ---");
    console.error("Request URL:", req.originalUrl); // Log URL for context
    console.error("Status Code:", statusCode);
    console.error("Message:", message);
    console.error("Stack:", err.stack);
    console.error("--- End Error ---");

    // Check if the request path looks like an API endpoint OR if the client prefers JSON
    if (req.originalUrl.startsWith('/api') ||
        req.originalUrl.startsWith('/pins') ||
        req.originalUrl.startsWith('/auth') ||
        req.originalUrl.startsWith('/login') || // Added API-like paths
        req.originalUrl.startsWith('/signup') ||
        req.originalUrl.startsWith('/logout') ||
        req.originalUrl.startsWith('/verify-email') ||
        req.accepts(['json', 'html']) === 'json') { // More robust check for JSON preference

        // Ensure statusCode is a valid number before sending
        const validStatusCode = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
        res.status(validStatusCode).json({ message: message }); // Always Send JSON error
    } else {
        // Fallback for non-API routes (render HTML error page if needed)
        // Ensure statusCode is valid here too
        const validStatusCode = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;
        // You might still want to render an EJS page for full page errors
        // but avoid it if the request indicates it wants JSON
        res.status(validStatusCode).send(`<html><body><h1>Error ${validStatusCode}</h1><p>${message}</p></body></html>`); // Basic HTML fallback
        // Or keep your EJS render if preferred for non-API errors:
        // res.status(validStatusCode).render("error.ejs", { err });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
