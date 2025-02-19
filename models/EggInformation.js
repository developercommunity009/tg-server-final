const mongoose = require("mongoose");

const EggInformationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    eggId: {
      type: String,
      required: true,
      unique: true,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processed", "Stored", "Used"],
      default: "Pending",
    },
    details: {
      type: String,
      required: true,
    },
    patientRequest: {
      type: String,
      enum: ["Confirm", "Deny"],
      default: "Deny",
    },
    doctorConfirmation: {
      type: Boolean,
      default: false,
    },
    attachReason: {
      type: String,
      default: null,
    },
    retrievedEggs: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EggInformation", EggInformationSchema);
