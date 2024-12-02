const mongoose = require("mongoose");
const User = require("../models/user.model");

const adminCheck = async (req, res, next) => {
    try {
        const {id} = req.validatedUserId;

        // Validate the user ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
        }

        // Query user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "User email is not verified",
            });
        }

        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "User is not an admin",
            });
        }

        // User is valid and authorized, proceed to the next middleware
        next();
    } catch (error) {
        console.error("Error in adminCheck middleware:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};

module.exports = adminCheck;
