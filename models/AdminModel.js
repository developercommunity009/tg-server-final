const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
// const validator = require("validator");

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true },
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      // validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: { type: String, required: true },
    confrimPassword: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    role: { type: String, default: "Admin" },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confrimPassword = undefined; // Remove confirmPassword field
  next();
});

// Update passwordChangedAt field on password change
adminSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare passwords
adminSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  return resetToken;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
