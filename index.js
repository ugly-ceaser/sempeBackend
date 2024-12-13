const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const Router = require("./routes");
const _db = require("./configs/db.config");
require("dotenv").config();
require("./cronjob");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Logging
app.use(morgan("dev"));

// Middleware: CORS Configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware: JSON and URL-encoded Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Debug Logging (Body and Query Parameters)
app.use((req, res, next) => {
    console.log("Body:", req.body);
    next();
});

// API Routes
app.use("/api", Router);

// Middleware: Error Handling
app.use(errorHandler);

// Initialize Database and Start Server
_db()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
    });

// Export the app instance for use in other files (e.g., for testing or additional configuration)
module.exports = app;
