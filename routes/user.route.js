const express = require("express");
const multer = require("multer");

const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const {
    getAllUsers,
    getUser,
    updateUser,
    getApprovedUsers,
    uploadGalleryImg,
} = require("../controllers/user.controller");
const storage = require("../configs/cloudinary.config");

const userRoute = express.Router();

const profileUpload = multer({
    storage: storage("profiles", {
        width: 400,
        height: 400,
        crop: "thumb",
        gravity: "face",
    }),
});

// For galleries images
const galleriestUpload = multer({
    storage: storage("gallery", {
        width: 1200,
        height: 800,
        crop: "fill",
    }),
});

userRoute.route("/approved").get(getApprovedUsers);

userRoute.route("/").get(validateToken, getAllUsers);
userRoute
    .route("/:userId/gallery")
    .post(
        validateToken,
        galleriestUpload.single("gallery_img"),
        uploadGalleryImg,
    );
userRoute
    .route("/:userId")
    .put(validateToken, profileUpload.single("profileImg"), updateUser);
userRoute.route("/:userId").get(validateToken, getUser);
// Route to fetch approved users with paginatio

module.exports = userRoute;
