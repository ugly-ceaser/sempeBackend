const express = require("express");
const multer = require("multer");

const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const adminCheck = require("../middlewares/adminCheck");
const {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent,
} = require("../controllers/event.controller");
const storage = require("../configs/cloudinary.config");

const eventRoute = express.Router();

const upload = multer({
    storage: storage("events"),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB file size limit
    },
});

eventRoute.post(
    '/',
    validateToken,
    adminCheck,
    upload.single("cover_image"),
    checkForMissingFields(["title", "description", "date"]),
    createEvent
);

eventRoute.get('/', getAllEvents);

eventRoute.get("/:eventId", getEvent);

eventRoute.put(
    "/:eventId",
    validateToken,
    adminCheck,
    upload.single("cover_image"),
    updateEvent
);

eventRoute.delete("/:eventId", validateToken, adminCheck, deleteEvent);

module.exports = eventRoute;
