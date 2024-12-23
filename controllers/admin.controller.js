const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const sendMail = require("../utils/sendMail");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");


// /users/:userId/${'activate' || 'deactivate'}
// METHOD post
// ACCESS Admin only
// DESC Activate/Deactivate users

const adminActivateOrDeactivateUser = asyncHandler(async (req, res) => {
    const { userId, action } = req.params;
    console.log(userId);
    console.log(action);
    const value =
        action === "activate"
            ? true
            : action === "deactivate"
              ? false
              : (() => {
                    res.status(401);
                    throw new Error(
                        "Invalid action. Use 'activate' or 'deactivate'.",
                    );
                })();
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    user.isActive = value;
    await user.save();
    return res.status(200).json({
        success: true,
        message: `User ${action}d successfully`,
        data: user,
    });
});

// /users/:userId (DELETE) - Delete user (Admins only)
const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    try {
        const user = await User.findByIdAndDelete(userId);
        if (user?.imageUrl) {
            const publicId = user.imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(200).json({
            success: true,
            message: "user deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
});


/**
 * Admin function to verify a user.
 * Endpoint: POST /users/:userId/verify
 * Access: Admin only
 */
const adminVerifyUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Set user as verified
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "User verified successfully",
        data: {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            isVerified: user.isVerified,
        },
    });
});





module.exports = {
    adminActivateOrDeactivateUser,
    deleteUser,
    adminVerifyUser
   
};  