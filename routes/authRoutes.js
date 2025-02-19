const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middelwares/authMiddleware');

router.post('/doctor/dlogin', authController.doctorLogin);
router.post("/admin/register", authController.registerAdmin);
router.post('/admin/login', authController.adminLogin);
router.post('/patient/login', authController.patientLogin);
router.post('/logout', authController.logout);

// Admin
router.post("/forgetpassword" ,authController.forGetPassword);
router.patch("/resetpassword/:token" ,authController.reSetPassword);
router.post("/updatingpassword" ,protect, authController.updatingPassword);



module.exports = router;


