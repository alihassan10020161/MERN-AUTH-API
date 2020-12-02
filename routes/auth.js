const express=require('express');
const router=express.Router();

// importing controller
const {signup,accountActivation,signin, forgotPassword, resetPassword, googleLogin, facebookLogin}=require('../controllers/auth');

// import middlewares
const{userSignupValidator,userSingInValidator, forgotPasswordValidator, resetPasswordValidator}=require('../middlewares/auth');
const{runValidation}=require('../middlewares');
// signUp Routers
router.post('/api/signup',userSignupValidator,runValidation, signup);
router.post('/api/account-activation',accountActivation);
// signIn Routers
router.post('/api/signin',userSingInValidator,runValidation, signin);
// forgot password || reset
router.put('/api/forgot-password',forgotPasswordValidator,runValidation,forgotPassword);
router.put('/api/reset-password',resetPasswordValidator,runValidation,resetPassword);
// google ||facebook routes
router.post('/api/google-login',googleLogin);
router.post('/api/facebook-login',facebookLogin);

module.exports=router;