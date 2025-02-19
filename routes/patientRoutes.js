const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientControllers');
const authController = require('../controllers/authController');
const { protect, checkAdmin } = require('../middelwares/authMiddleware'); // Assuming you have authentication middleware
const { checkEmbryologist, checkFertility } = require("../middelwares/authMiddleware");
// Public Routes
router.get('/', patientController.getAllPatients);
router.get('/:patientId', patientController.getPatientByPatientId);
router.get('/:id', patientController.getPatientById);

// Admin Only Routes
router.post('/createpatient', protect, checkAdmin, patientController.createPatient);
router.put('/:patientId', protect , patientController.updatePatient);
router.delete('/:id', protect, checkAdmin, patientController.deletePatient);


// Patient
router.post("/forgetpassword" , authController.forGetPasswordPatient);
router.patch("/resetpassword/:token" , authController.reSetPasswordPatient);
router.post("/updatingpassword" , protect, authController.updatingPasswordPatient);

module.exports = router;
