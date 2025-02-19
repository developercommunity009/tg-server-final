const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Define the Gender and Speciality Enums
const genderEnum = ['Male', 'Female'];
const specialityEnum = ['Fertility Specialist', 'Embryologist']; // Enum for specialities

const doctorSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },
    doctorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: genderEnum,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    speciality: {
      type: String,
      enum: specialityEnum, // Enum to define specialist type
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    confrimPassword: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
  },
  { timestamps: true }
);

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confrimPassword = undefined; // Remove confirmPassword field
  next();
});

// Update passwordChangedAt field on password change
doctorSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare passwords
doctorSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
doctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
doctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  return resetToken;
};

module.exports = mongoose.model("Doctor", doctorSchema);