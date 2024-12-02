const Mongoose = require("mongoose");
//just a simple event model
const eventSchema = Mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "Completed", "Cancelled"],
            default: "upcoming"
        }
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)


// Expose id as a virtual field
eventSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

module.exports = Mongoose.model("Event", eventSchema);