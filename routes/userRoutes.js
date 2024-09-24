const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadAndProcessImage } = require('../middelwares/imageUploder');


router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/updateprofileimagebywallet', uploadAndProcessImage, userController.updateProfileImageByWallet);


module.exports = router;
