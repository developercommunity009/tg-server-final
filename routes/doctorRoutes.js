const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorControllers');
const authController = require('../controllers/authController');
const { protect, checkAdmin } = require('../middelwares/authMiddleware'); // Assuming you have authentication middleware
const { checkEmbryologist, checkFertility } = require("../middelwares/authMiddleware");
// Public Routes
router.get('/', doctorController.getAllDoctors);
router.get('/:doctorId',protect ,doctorController.getDoctorByDoctorId );
router.get('/:id', doctorController.getDoctorBy);



router.post('/createdoctor', protect, checkAdmin, doctorController.createDoctor);
router.put('/:doctorId', protect , doctorController.updateDoctor);
router.delete('/:id', protect, checkAdmin, doctorController.deleteDoctor);


// Doctor
router.post("/forgetpassword" , authController.forGetPasswordDoctor);
router.patch("/resetpassword/:token" , authController.reSetPasswordDoctor);
router.route("/updatingpassword" , protect, authController.updatingPasswordDoctor);




module.exports = router;
