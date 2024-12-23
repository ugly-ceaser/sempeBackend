const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const validateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided",
        });
    }
    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("Invalid token");
            }
            return decoded;
        }
    );
    
    // Find the user based on the decoded token
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(403).json({
            message: "Unauthorized Access",
        });
    }
    
    // Check if user is active
    if (!user.isActive) {
        return res.status(403).json({
            message: "This account is not active, please contact administrators",
        });
    }
    
    // Attach user to req object so it can be accessed in the controller
    req.user = user; // Add the user to the request object
    
    next();
});

module.exports = validateToken;
