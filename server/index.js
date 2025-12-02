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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const pinRouter = require(path.join(__dirname, "routes", "pin.js"));
const authRouter = require(path.join(__dirname, "routes", "auth.js")); // New route for Google
const userRouter = require(path.join(__dirname, "routes", "user.js"));
const boardRouter = require(path.join(__dirname, "routes", "board.js"));
const commentRouter = require(path.join(__dirname, "routes", "comment.js"));

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

app.set('trust proxy', 1);

// Helmet - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", process.env.CLIENT_URL],
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiters
app.use('/login', authLimiter);
app.use('/signup', authLimiter);
app.use('/api/refresh', authLimiter);
app.use(generalLimiter);

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Cookie parser (needed for refresh tokens)
app.use(cookieParser());

const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://pinch-nk6z.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl tests) or from the allow list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: This origin is not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    }, credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve static files from React app ONLY in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    console.log('Serving static files from:', clientBuildPath);
    app.use(express.static(clientBuildPath));
}

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    },
    proxy: true
}

console.log("Session Options Being Applied:", JSON.stringify(sessionOptions, (key, value) => {
    if (key === 'secret') return '[REDACTED]';
    if (key === 'store') return '[MongoStore Instance]';
    return value;
}, 2));
app.use(session(sessionOptions));
app.use(flash());


require('./config/passport');
app.use(passport.initialize());
// app.use(passport.session());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

// Root redirect for API
app.get("/api/health", (req, res) => {
    res.json({ message: "Pinch API Server", status: "running" });
});

app.use("/", userRouter);
app.use("/api", commentRouter);
app.use("/api/boards", boardRouter);
app.use("/pins", pinRouter);
app.use("/auth", authRouter);

app.get("*", (req, res, next) => {
    if (req.accepts('html') && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
        next();
    }
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "API endpoint not found!"));
});

// Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    console.error("--- Central Error Handler ---");
    console.error("Request URL:", req.originalUrl);
    console.error("Status Code:", statusCode);
    console.error("Message:", message);
    console.error("Stack:", err.stack);
    console.error("--- End Error ---");

    const validStatusCode = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500;

    // Always return JSON for API server
    res.status(validStatusCode).json({
        error: message,
        statusCode: validStatusCode
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
