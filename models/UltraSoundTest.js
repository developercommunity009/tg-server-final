const mongoose = require("mongoose");

const ultrasoundTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  testDate: { type: Date, required: true, default: Date.now },
  testType: {
    type: String,
    enum: ["Abdominal", "Pelvic", "Obstetric", "Cardiac", "Thyroid", "Other"],
    default:"Obstetric",
    required: true,
  },
  findings: { type: String, required: true },
  result: { type: String, enum: ["Normal", "Abnormal"], required: true },
  remarks: { type: String, default: "" },
});

const UltraSoundTest = mongoose.model("UltraSoundTest", ultrasoundTestSchema);
module.exports = UltraSoundTest;
