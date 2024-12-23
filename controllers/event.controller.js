const mongoose = require("mongoose");
const Event = require("../models/event.model");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

// /events/ (POST) - Create a new Event (Admins only)
const createEvent = asyncHandler(async (req, res) => {
    const { title, date, description } = req.body;

    // Ensure an image was uploaded
    if (!req.file) {
        console.log("Cover image is required");
        return res.status(400).json({
            success: false,
            message: "Cover image is required",
        });
    }

    try {
        const event = await Event.create({
            title,
            date,
            description,
            imageUrl: req.file.path,
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Database error: Please check input data",
            error: error,
        });
    }
});

// /events/ (GET) - Fetch all events with pagination
const getAllEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const events = await Event.find({})
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (events.length < 1) {
            return res.status(404).json({
                success: false,
                message: "No events found",
            });
        }

        const totalEvents = await Event.countDocuments({});
        const totalPages = Math.ceil(totalEvents / limit);

        res.set({
            "X-Pagination-Total-Pages": totalPages,
            "X-Pagination-Page": page,
            "X-Pagination-Limit": limit,
        });

        res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: events,
            pagination: { total: totalEvents, totalPages, page, limit },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database error: Please check input data",
        });
    }
});

// /events/:eventId (GET) - Fetch event by ID
const getEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid event ID format",
        });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database error: Please confirm input",
        });
    }
});

// /events/:eventId (PUT) - Update event details (Admins only)
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid event ID format",
        });
    }

    if (!req.body && !req.file) {
        return res.status(400).json({
            success: false,
            message: "No data provided to update",
        });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found",
        });
    }

    const validKeys = Object.keys(Event.schema.obj);
    const invalidKeys = Object.keys(req.body).filter(
        (key) => !validKeys.includes(key),
    );

    // Throw an error if there are invalid keys
    if (invalidKeys.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid field(s): ${invalidKeys.join(", ")}`,
        });
    }

    try {
        if (req.file) {
            // Remove old image from Cloudinary if present
            if (event.imageUrl) {
                const publicId = event.imageUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
            event.imageUrl = req.file.path;
        }

        Object.assign(event, req.body);
        await event.save();

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update event",
        });
    }
});

// /events/:eventId (DELETE) - Delete event (Admins only)
const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    console.log(eventId)

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid event ID format",
        });
    }

    try {
        const event = await Event.findByIdAndDelete(eventId);
        if (event?.imageUrl) {
            const publicId = event.imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete event",
        });
    }
});

module.exports = {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent,
};
