const express=require('express');
const router=express.Router();

// importing middlewares
const {requireSignin,adminMiddleware} =require('../middlewares/auth')
// importing controller
const {read,update}=require('../controllers/user');

// User Routers
router.get('/api/user/:id',requireSignin, read);
router.put('/api/user/update',requireSignin, update);//we get the user id from token which is find by middleware
router.put('/api/admin/update',requireSignin, adminMiddleware ,update);//we update admin only at this endpoint for admin,firt signinuser compulsory

module.exports=router;