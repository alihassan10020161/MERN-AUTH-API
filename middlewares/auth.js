const {check}=require('express-validator')
const expressJwt=require('express-jwt');
const user = require('../models/user');


exports.userSignupValidator=[
    check('name')
    .not()
    .isEmpty().withMessage('Name is requried'),
    check('email')
    .isEmail().withMessage('Must be a valid email address'),
    check('password')
    .isLength({min: 6}).withMessage('Password must be at least 6 characters logn'),
]

exports.userSingInValidator=[
    check('email')
    .isEmail().withMessage('Must be a valid email address'),
    check('password')
    .isLength({min: 6}).withMessage('Password must be at least 6 characters logn'),
]

exports.forgotPasswordValidator=[
    check('email')
    .not()
    .isEmpty()
    .isEmail().withMessage('Must be a valid email address'),
    ]

exports.resetPasswordValidator=[
    check('newPassword')
    .not()
    .isEmpty()
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters logn'),
]


exports.requireSignin=expressJwt({ secret: process.env.JWT_SECRET , algorithms: ['HS256']});

exports.adminMiddleware=(req,res,next)=>{
    user.findById({_id: req.user._id}).exec((err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error:'User not found'
            })
        }
        if(user.role !== 'admin'){
            return res.status(400).json({
                error:'Admin resource. Access denied.'
            })
        }
        req.profile=user;
        next();
    })
}