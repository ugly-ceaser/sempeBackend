const express = require("express");
const multer = require("multer");

const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const {
    getAllUsers,
    getUser,
    uploadGalleryImg
} = require("../controllers/user.controller");

const {adminActivateOrDeactivateUser,deleteUser,adminVerifyUser} = require("../controllers/admin.controller");
const adminCheck = require("../middlewares/adminCheck");
const storage = require("../configs/cloudinary.config");

  // For galleries images
  const galleriestUpload = multer({ 
    storage: storage('gallery', { 
      width: 1200, 
      height: 800, 
      crop: 'fill' 
    })
  });
const adminRoute = express.Router();


adminRoute.route("/users").get(validateToken, adminCheck, getAllUsers);
adminRoute.route("/user/:userId").get(validateToken, adminCheck, getUser);
adminRoute.route("/user/:userId/:action").post(validateToken, adminCheck, adminActivateOrDeactivateUser);
adminRoute.route("/user/:userId").put(validateToken, adminCheck,galleriestUpload.single("gallery_img"), uploadGalleryImg);
adminRoute.route('/user/:userId').post(validateToken, adminCheck,adminVerifyUser)

adminRoute.route("/user/:userId").delete(validateToken, adminCheck, deleteUser);

module.exports = adminRoute;
