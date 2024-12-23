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

const corsOptions = {
    origin: "*", // Allows requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "api_key"], // Added "api_key"
    credentials: false, // Disables sending cookies or credentials
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enables preflight requests for all routes

// Middleware: JSON and URL-encoded Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Debug Logging (Body and Query Parameters)
app.use((req, res, next) => {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // console.log("Headers:", req.headers);
    // console.log("Query Params:", req.query);
    console.log("Body:", req.body);
    next();
});

// Serve Uploaded Images
app.use("/uploads/images", express.static(path.join(__dirname, "uploads", "images")));

// API Routes
app.use("/api", Router);

// Serve Static Files from Dist Folder
app.use(express.static(path.join(__dirname, "dist")));

// Route: Email Verified
app.get("/email/verified", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Immaculate Conception Alumni</title>
            <script>
                alert('Verification is successful!');
                window.location.href = 'https://www.cicalumni2010.org'; // Redirect to home
            </script>
        </head>
        <body>
            <h1>Verification Successful</h1>
            <p>You have successfully verified your account.</p>
        </body>
        </html>
    `);
});

app.get("/test", (req, res) => {
    res.send({
        message: 'server is live'
    });
});
// Handle Unmatched Routes
app.get("*", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

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

// Export the Express app as a serverless function
module.exports = app;

// Vercel requires a default export for serverless functions
module.exports = (req, res) => {
    app(req, res);
};
