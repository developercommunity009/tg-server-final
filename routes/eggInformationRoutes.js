const express = require("express");

const router = express.Router();
const {
  createEggInformation,
  getAllEggInformation,
  getEggInformationById,
  updateEggInformation,
  deleteEggInformation,
} = require("../controllers/eggInformationController");
const { checkEmbryologist, checkFertility } = require("../middelwares/authMiddleware");


// Routes
router.post("/", createEggInformation);
router.get("/", getAllEggInformation);
router.get("/:id", getEggInformationById);
router.put("/:id", updateEggInformation);
router.delete("/:id", deleteEggInformation);

module.exports = router;
