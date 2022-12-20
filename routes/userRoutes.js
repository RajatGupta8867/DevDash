const express = require('express');
const usersController = require('./../controller/usersController');
const router = express.Router();
const authController=require('./../controller/authController')

router.post('/signup',authController.signup)
router.post('/login',authController.login)

router.patch('/updateMyPassword',authController.protect,authController.updatePassword)

router.patch('/updateMe',authController.protect,usersController.updateMe)
router.delete('/deleteMe',authController.protect,usersController.deleteMe)

// router.post('/forgotPassword',authController.forgotPassword)
// router.post('/resetPassword',authController.resetPassword)

router
  .route('/')
  .get(authController.protect,usersController.getAllUsers)
  .post(usersController.createAUser);
router
  .route('/:id')
  .get(usersController.getAUser)
  .patch(usersController.updateAUser)
  .delete(authController.protect,
    authController.restrictTo('admin','chota-admin'), usersController.deleteAUser);

module.exports = router;

