const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const mongoose = require("mongoose");

// Helper function for consistent error responses
const errorResponse = (res, status, message) => {
    res.status(status);
    throw new Error(message);
};

// Helper function to generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

// auth/register
// METHOD POST
// ACCESS PUBLIC

const register = asyncHandler(async (req, res) => {
    const {
        username,
        fullname,
        email,
        password,
        phone,
        admin: isAdmin,
        location,
    } = req.body;

    // Input validation
    if (fullname.split(" ").length < 2) {
        errorResponse(res, 400, "Fullname should consist of firstname and lastname");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorResponse(res, 400, "Invalid email address");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        errorResponse(res, 400, "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character");
    }

    // Check existing users by username, email, or phone
    const existingUser = await User.findOne({
        $or: [{ email }, { phone }, { username }],
    });
    if (existingUser) {
        errorResponse(res, 400, existingUser.email === email ? "Email already exists" : existingUser.phone === phone ? "Phone number already exists" : "Username already exists");
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        username,
        fullname,
        email,
        phone,
        password: hashedPassword,
        isAdmin,
        location,
    });

    if (!newUser) {
        errorResponse(res, 500, "Failed to register user");
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await newUser.save();

    return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: { 
            user: {
                ...newUser.toObject(),
                password: undefined
            }
        },
    });
});

// auth/login
// METHOD POST
// ACCESS PUBLIC

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
  
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found", "Please verify your email before logging in");
    }
  
    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid credentials");
    }
  
    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
  
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();
  
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
  
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { 
        user: userObj,
        accessToken,
        refreshToken,
      },
    });
  });
  

// auth/email/request
// METHOD POST
// ACCESS PRIVATE

const requestEmail = asyncHandler(async (req, res) => {
    let { email, redirect_url } = req.body;

    redirect_url = 'https://www.cicalumni2010.org/api/auth/email/verify';

    if (!email || !redirect_url) {
        errorResponse(res, 400, "Email and redirect URL are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        errorResponse(res, 404, "User not found");
    }

    if (user.isVerified) {
        errorResponse(res, 400, "Email is already verified");
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires > Date.now()) {
        console.log("User requested a new verification email before expiration.");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // Reset to 1 hour from now
    await user.save();

    const verificationLink = `${redirect_url}?token=${verificationToken}`;
    const message = `
        <h2>Email Verification</h2>
        <p>Hi ${user.fullname},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" target="_blank">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendMail(email, "Verify your Email", message);

        console.log("email sent to ", email);
        return res.status(200).json({
            success: true,
            message: "Verification link sent successfully",
            redirectUrl: "https://www.cicalumni2010.org/email/verified"
        });
    } catch (err) {
        errorResponse(res, 500, "Failed to send verification email");
    }
});

//  auth/email/verify
//  METHOD GET
// ACCESS PRIVATE

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    const user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        errorResponse(res, 404, "Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Redirect to the verification success page
    return res.redirect(302, "https://www.cicalumni2010.org/email/verified");
});

// New refresh token endpoint
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        errorResponse(res, 400, "Refresh token is required");
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            errorResponse(res, 401, "Invalid refresh token");
        }

        const tokens = generateTokens(user._id);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return res.status(200).json({
            success: true,
            data: tokens
        });
    } catch (error) {
        errorResponse(res, 401, "Invalid refresh token");
    }
});

const verifyUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.validatedUserId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
        }
        // Use `findById` for querying by ObjectId.
        const user = await User.findById(id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        if (!user.verificationToken) {
            res.status(401);
            throw new Error("Please verify your email address");
        }

        return res.status(200).json({
            message: "user is verified",
            data: { user },
        });
    } catch (err) {
        res.status(500);
        throw new Error(err.message);
    }
});

// auth/password/forgot
// METHOD POST
// ACCESS PUBLIC
const forgotPassword = asyncHandler(async (req, res) => {
    const { email, username, redirectUrl } = req.body;

    if (!email && !username || !redirectUrl) {
        errorResponse(res, 400, "Email/Username and redirect URL are required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        errorResponse(res, 404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetLink = `${redirectUrl}?token=${resetToken}`;
    const message = `
        <h2>Password Reset</h2>
        <p>Hi ${user.fullname},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendMail(email, "Reset your Password", message);
        return res.status(200).json({
            success: true,
            message: "Password reset link sent successfully",
        });
    } catch (err) {
        errorResponse(res, 500, "Failed to send password reset email");
    }
});

// auth/password/reset
// METHOD POST
// ACCESS PUBLIC

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        errorResponse(res, 400, "Token and password are required");
    }

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        errorResponse(res, 404, "Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const id = req.user._id;  // User ID from the validated token
    const newPassword = req.body.password;  // New password from request body

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the new password

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Respond with a success message
    return res.status(200).json({
        message: "Password is changed successfully",
        data: { user: { email: user.email } },  // You can send the email or any other user details as needed
    });
});


module.exports = {
    register,
    login,
    requestEmail,
    verifyEmail,
    refreshToken,
    verifyUser,
    forgotPassword,
    resetPassword,
    changePassword
};
