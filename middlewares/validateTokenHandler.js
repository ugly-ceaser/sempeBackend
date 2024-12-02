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
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("Invalid token");
            }
            return decoded;
        },
    );
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(403).json({
            message: "Unauthorized Access",
        });
    }
    if (!user.isActive) {
        return res.status(403).json({
            message: "This account is not active please contact administrators",
        });
    }
    req.validatedUserId = decoded;
    next();
});

module.exports = validateToken;
