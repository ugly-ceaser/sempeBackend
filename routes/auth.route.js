const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const {
    register,
    login,
    requestEmail,
    verifyEmail,
    verifyUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword
} = require("../controllers/auth.controller");

const validateToken = require("../middlewares/validateTokenHandler");
const authRoute = express.Router();

// Auth routes
authRoute.post("/register", 
    checkForMissingFields(["fullname", "email", "password"]), 
    register
);

authRoute.post("/login", 
    checkForMissingFields(["email", "password"]), 
    login
);

// Email verification routes
authRoute.post("/email/request", 
    checkForMissingFields(["email", "redirect_url"]), 
    requestEmail
);

authRoute.get("/email/verify", verifyEmail);

// User verification route
authRoute.get("/user/verify", 
    validateToken, 
    verifyUser
);

// New route for refresh token
authRoute.post("/refresh-token", 
    checkForMissingFields(["refreshToken"]), 
    refreshToken
);

authRoute.post('/password/forgot', forgotPassword);
authRoute.post('/password/reset', resetPassword); 
authRoute.put('/change-password',validateToken,changePassword)


module.exports = authRoute;
