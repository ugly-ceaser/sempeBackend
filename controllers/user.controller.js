const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const sendMail = require("../utils/sendMail");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

// /users/
// METHOD GET
// ACCESS Admin only
// DESC fetch all users

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const users = await User.find({})
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (users.length < 1) {
            return res.status(404).json({
                success: false,
                message: "No events found",
            });
        }
        const totalUsers = await User.countDocuments({});
        const totalPages = Math.ceil(totalUsers / limit);

        res.set({
            "X-Pagination-Total-Pages": totalPages,
            "X-Pagination-Page": page,
            "X-Pagination-Limit": limit,
        });

        return res.status(200).json({
            success: true,
            message: "returning all users",
            data: users,
            pagination: { total: totalUsers, totalPages, page, limit },
        });
    } catch (error) {
        res.status(500);
        throw new Error("An Error occured please check input data");
    }
});

// /users/:userId
// METHOD GET
// ACCESS private(loged in users)
// DESC fetch user by Id

const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract userId from the request params.

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }
    // Use `findById` for querying by ObjectId.
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    return res.status(200).json({
        success: true,
        message: "returning single user",
        data: user,
    });
});

// /users/:userId/${'activate' || 'deactivate'}
// METHOD post
// ACCESS Admin only
// DESC Activate/Deactivate users

const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    console.log(req.body);
    console.log(req.file);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID format",
        });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Validate the fields to update
    const validKeys = Object.keys(User.schema.obj);
    const invalidKeys = Object.keys(req.body).filter(
        (key) => !validKeys.includes(key),
    );

    if (invalidKeys.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid field(s): ${invalidKeys.join(", ")}`,
        });
    }

    try {
        // Check if file (image) is provided for update
        if (req.file) {
            // Remove old image from Cloudinary if present
            if (user.profileImg) {
                const publicId = user.profileImg.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            user.profileImg = result.secure_url; // Update the user's image URL
        }

        // Update the fields in the user document with the data from the body
        Object.assign(user, req.body);

        // Hash the password if it's updated
        if (req.body.password) {
            user.password = crypto
                .createHash("sha256")
                .update(req.body.password)
                .digest("hex");
        }

        // Save the updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
});

const uploadGalleryImg = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { galleryImg } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    user.galleryImg = galleryImg;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Gallery image uploaded successfully",
        data: user,
    });
});

// Fetch users whose profile is approved (profileApproved: true) with pagination
const getApprovedUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

    try {
        // Fetch users with pagination and profileApproved = true, excluding sensitive fields
        const users = await User.find({ 
            profileApproved: true, 
            profileImg: { $ne: null, $ne: "" } // Check for not null and not empty string
        })
            .select("-password -verificationToken -isVerified -isAdmin -isActive -refreshToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires") // Exclude sensitive fields
            .skip((page - 1) * limit) // Skipping users based on page and limit
            .limit(parseInt(limit)); // Limiting the number of users

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No approved users found",
            });
        }

        // Calculate total users and pages
        const totalUsers = await User.countDocuments({ profileApproved: true });
        const totalPages = Math.ceil(totalUsers / limit);

        res.set({
            "X-Pagination-Total-Pages": totalPages,
            "X-Pagination-Page": page,
            "X-Pagination-Limit": limit,
        });

        return res.status(200).json({
            success: true,
            message: "Fetched approved users successfully",
            data: users,
            pagination: {
                total: totalUsers,
                totalPages,
                page,
                limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch approved users",
            error: error.message,
        });
    }
});


module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    getApprovedUsers,
    uploadGalleryImg,
};
