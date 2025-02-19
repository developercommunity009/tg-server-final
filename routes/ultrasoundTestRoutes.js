const express = require("express");
const router = express.Router();
const {
  createUltraSoundTest,
  getAllUltraSoundTests,
  getUltraSoundTestById,
  updateUltraSoundTest,
  deleteUltraSoundTest,
} = require("../controllers/ultraSoundTestController");

// 📌 Create a new ultrasound test record
router.post("/", createUltraSoundTest);

// 📌 Get all ultrasound test records
router.get("/", getAllUltraSoundTests);

// 📌 Get a single ultrasound test record by ID
router.get("/:id", getUltraSoundTestById);

// 📌 Update an ultrasound test record
router.put("/:id", updateUltraSoundTest);

// 📌 Delete an ultrasound test record
router.delete("/:id", deleteUltraSoundTest);

module.exports = router;
