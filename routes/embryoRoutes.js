const express = require("express");
const router = express.Router();
const {
  createEmbryo,
  getAllEmbryos,
  getEmbryoById,
  updateEmbryo,
  deleteEmbryo,
} = require("../controllers/embryoController");
const { checkEmbryologist, checkFertility } = require("../middelwares/authMiddleware");

// Routes
router.post("/", createEmbryo);
router.get("/", getAllEmbryos);
router.get("/:id", getEmbryoById);
router.put("/:id", updateEmbryo);
router.delete("/:id", deleteEmbryo);

module.exports = router;
