const Mongoose = require("mongoose");

const userSchema = Mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensure that username is unique
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    dob: {
      type: Date,
      required: false,
    },
    nickname: {
      type: String,
      required: false,
    },
    profileApproval: {
      type: Boolean,
      default: false,
    },
    galleryImg: {
      type: String,
      required: false,
    },
    profileImg: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    address: {
      type: {
        state: String,
        country: String,
        phone: String,
      },
      default: null,
    },
    cv: {
      type: {
        resume: {
          type: String,
          required: false,
        },
        occupation: {
          type: String,
          required: false,
        },
      },
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: null
    },
    verificationTokenExpires: {
      type: Date,
      default: null
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true,
    validateModifiedOnly: true,
  }
);

// Expose id as a virtual field
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", { virtuals: true });

module.exports = Mongoose.model("User", userSchema);
