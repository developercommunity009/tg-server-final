const mongoose = require("mongoose");

const embryoSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  embryoId: { type: String, required: true, unique: true },
  fertilizationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Growing", "Frozen", "Transferred", "Discarded"],
    required: true,
  },
});

const Embryo = mongoose.model("Embryo", embryoSchema);
module.exports = Embryo;

