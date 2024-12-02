const Mongoose = require("mongoose");

const projectSchema = Mongoose.Schema(
    {
        projectType: {
            type: String,
            required: true
        },
        timeline: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true
            }
        },
        budget: {
            type: Number,
            required: true
        },
        overview: {
            type: String,
            required: true
        },
        isPublished: {
            type: Boolean,
            default: false
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
projectSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

module.exports = Mongoose.model("Project", projectSchema);