const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

// Define the Gender Enum
const genderEnum = ['Male', 'Female'];

// Define the Pregnancy Status Enum
const pregnancyStatusEnum = ['Not Pregnant', 'Pregnant'];

const patientSchema = new mongoose.Schema({
  profilePicture: {
    type: String,
  },
  patientId: {
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
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
  phoneNumber: {
    type: String,
  },
  maritalStatus: {
    type: String,
    required: true,
  },
  partnerId: {
    type: String,
  },
  pregnancyStatus: {
    type: String,
    enum: pregnancyStatusEnum,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
}, { timestamps: true });

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confrimPassword = undefined; // Remove confirmPassword before saving
  next();
});

// Update passwordChangedAt field on password change
patientSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare passwords
patientSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
patientSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
patientSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  return resetToken;
};

module.exports = mongoose.model('Patient', patientSchema);

