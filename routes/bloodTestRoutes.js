const express = require("express");
const router = express.Router();
const {
  createBloodTest,
  getAllBloodTests,
  getBloodTestById,
  updateBloodTest,
  deleteBloodTest,
} = require("../controllers/bloodTestController");

// Routes
router.post("/", createBloodTest);
router.get("/", getAllBloodTests);
router.get("/:id", getBloodTestById);
router.put("/:id", updateBloodTest);
router.delete("/:id", deleteBloodTest);

module.exports = router;
