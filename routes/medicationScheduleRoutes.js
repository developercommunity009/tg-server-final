const express = require("express");
const router = express.Router();
const {
  createMedicationSchedule,
  getAllMedicationSchedules,
  getMedicationScheduleById,
  updateMedicationSchedule,
  deleteMedicationSchedule,
} = require("../controllers/medicationScheduleController");
const { checkEmbryologist, checkFertility } = require("../middelwares/authMiddleware");

// Routes
router.post("/", createMedicationSchedule);
router.get("/", getAllMedicationSchedules);
router.get("/:id", getMedicationScheduleById);
router.put("/:id", updateMedicationSchedule);
router.delete("/:id", deleteMedicationSchedule);

module.exports = router;
