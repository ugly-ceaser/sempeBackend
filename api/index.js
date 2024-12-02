const express = require("express");
const errorHandler = require("../middlewares/errorHandler");
const Router = require("../routes");
const _db = require("../configs/db.config");
const cors = require("cors");
const morgan = require("morgan");
const serverless = require("serverless-http");

require("dotenv").config();
require("../cronjob");

const app = express();

// Middleware
app.use(morgan("dev"));

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads/images", express.static("./uploads/images"));

// Routes
app.use("/api", Router);
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Initialize database connection
_db().then(() => {
    console.log("Connected to the database");
});

// Export as a serverless function
module.exports.handler = serverless(app);
