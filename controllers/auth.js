const User=require('../models/user')
const jwt=require('jsonwebtoken')
// sendgrid
const sMail=require('nodemailer');
const _=require('lodash')
// google auth import
const {OAuth2Client}=require('google-auth-library')
const fetch=require('node-fetch')

// Triditional signup methode without verification

// exports.signup=(req,res)=>{
//     // console.log('REQ BODY ON SIGNUP', req.body);
//  const {name,email,password}=req.body;

//  User.findOne({email}).exec((err,user)=>{
//      if(user){
//          return res.status(400).json({
//              error: 'Email is taken'
//          })
//      }
//  })
//  let newUser= new User({name,email,password})
//  newUser.save((err,success) => {
//      if(err){
//          console.log('SIGNUP ERROR',err);
//          return res.status(400).json({
//              error: err
//          });
//      }
//      res.json({
//          message: 'SIGNUP! Success Please SIGNIN'
//      })
//  })
// }

exports.signup=(req,res)=>{
    // with Email verivication method
    const {name,email,password}=req.body;
     User.findOne({email}).exec((err,user)=>{
         if(user){
             return res.status(400).json({
                 error: 'Email is taken'
             })
         }
         const token=jwt.sign({name,email,password},process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn:'10m'})
         const emailData={
             from: process.env.EMAIL_FROM,
             to: email,
             subject: 'Accont activation link',
             html:`
             <p>Please use the following link to activate your account</p>
             <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
             <hr/>
             <p>This email may contain sensetive information</p>
             <p>${process.env.CLIENT_URL}</p>
             
             `
         }


         var transporter = sMail.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
              user: process.env.EMAIL_TO,
              pass: process.env.EMAIL_PASSWORD
            }
          });
          
          
          transporter.sendMail(emailData, function(error, info){
            if (error) {
            console.log('SIGNUP SENT ERROR',error)
          return res.json({
            message: err.message
        })

            } else {
              console.log('Email sent: ' + info.response);
              return res.json({
                message: `Email has been sent to ${email}. Follow the instruction to activate your account`
            })
            }
          });
          
          
        console.log('MAIL Sent Data',emailData);
     return res.json({
                 message: `Email has been sent to ${email}. Follow with instructions: ${emailData}`
             })
        })
    
}

exports.accountActivation = (req,res)=>{
    const {token}=req.body;
    if(token){
        jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION,function(err,decoded){
            if(err){
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR',err)
                return res.status(401).json({
                    error:'Expired link. Signup again'
                })
            }
            const{name,email,password}=jwt.decode(token)
            const user=new User({name,email,password})
            user.save((err,user) => {
                if(err){
                    console.log('Save user in account activation error',err)
                return res.status(401).json({
                    error:'Error saving user in database. Try signup again'
                    })
                }
                console.log(`Signup success. Please signin. ${user.name} email: ${user.email} password: ${user.password}`)
                return res.json({
                    message:`Signup success. Please signin.`
                })
            })
})
}        else{
    return res.json({
        message:'Some thing went wrong. Try again'
    })
}
}

exports.signin=(req,res)=>
{
    const{email,password}=req.body
    // check if user exist
    User.findOne({email}).exec((err,user)=>{
        if(err|| !user){
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            })
        }
        // authenticate
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Email and password do not match'
            })
        }
        // generate a token and send to client
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        const{_id,name,email,role}=user

        return res.json({
            token,
            user:{_id,name,email,role}
        })
    })
}


exports.forgotPassword=(req,res)=>{
    const {email}=req.body   
    User.findOne({email}).exec((err,user)=>{
        if(err|| !user){
            return res.status(400).json({
                error:'User with that email  does not exist'
            })
        }
        const token=jwt.sign({_id: user._id,name:user.name},process.env.JWT_RESET_PASSWORD, {expiresIn:'10m'})
        const emailData={
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'To Password Reset Link',
            html:`
            <p>Please use the following link to reset your password</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr/>
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
            
            `
        }
        return user.updateOne({resetPasswordLink: token},(err,success)=>{
            if(err){
                console.log('Reset password  link error',err)
                return res.status(400).json({
                    error:'Database connection error on user password on user password forgot request'
                })
            }else{
                var transporter = sMail.createTransport({
                    service: process.env.EMAIL_SERVICE,
                    auth: {
                      user: process.env.EMAIL_TO,
                      pass: process.env.EMAIL_PASSWORD
                    }
                  });
         
                  transporter.sendMail(emailData, function(error, info){
                    if (error) {
                    console.log('FORGOT PASSWORD SENT ERROR',error)
                  return res.json({
                    message: err.message
                })
         
                    } else {
                      console.log('Email sent: ' + info.response);
                      return res.json({
                        message: `Email has been sent to ${email}. Follow the instruction to reset your password`
                    })
         
         
             }
         })

            }
        })
})
}

exports.resetPassword=(req,res)=>{
    const{resetPasswordLink,newPassword}=req.body
    if(resetPasswordLink){
        jwt.verify(resetPasswordLink,process.env.JWT_RESET_PASSWORD,function(err,decoded){
         
            if(err){
                return res.status(400).json({
                    error:'Expired link. Try again with valid link'
                })
            }
   
            User.findOne({resetPasswordLink}).exec((err,user)=>{
                if(err|| !user){
                    return res.status(400).json({
                        error:'Something went wrong. Try again later'
                    })
                }
                const updatedFields={
                    password:newPassword,
                    resetPasswordLink:''
                }
                user=_.extend(user,updatedFields)
                user.save((err,result)=>{
                    if(err){
                        return res.status(400).json({
                            error:'Error reseting user password'
                        })
                    }
                    res.json({
                        message:`Great! Now you can login with new password`
                    })
                })
            })
        })
    }
}


const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
exports.googleLogin=(req,res)=>{
    const{idToken}=req.body
    client.verifyIdToken({idToken,audience:process.env.GOOGLE_CLIENT_ID})
    .then(response=>{
        // console.log('google login response',response)
        const{email_verified,name,email}=response.payload
        if(email_verified){
            // check already in database?
            User.findOne({email}).exec((err,user)=>{
                if(user){
                    const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
                    const{_id,email,name,role}=user
                    return res.json({
                        token,user:{_id,email,name,role}
                    })
                }
                else{
                    let password=email+process.env.JWT_SECRET
                    user=new User({name,email,password})
                    user.save((err,data)=>{
                        if(err){
                            console.log('Error google login on user save',err)
                            return res.status(400).json({
                                error:'User signup failed with google'
                            })
                        }
                        const token=jwt.sign({_id:data._id},process.env.JWT_SECRET,{expiresIn:'7d'})
                        const{_id,email,name,role}=data
                        return res.json({
                            token,user:{_id,email,name,role}
                        })  
                    })
                }
            })
        }
        else{
            return res.status(400).json({
                error:'Googel Login Failed. Try again'
            })
        }
    })
}

exports.facebookLogin=(req,res)=>{
    console.log('facebook login req body',req.body)
    const {userID,accessToken}=req.body

    const url =`https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`

    return(
        fetch(url,{
            method:'GET'
        })
        .then(response=>response.json())
        //.then(response=>console.log(response))
        .then(response=>{
            const {email,name}=response
            User.findOne({email}).exec((err,user)=>{
                if(user){
                    const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
                    const{_id,email,name,role}=user
                    return res.json({
                        token,user:{_id,email,name,role}
                    })
                }
                else{
                    let password=email+process.env.JWT_SECRET
                    user=new User({name,email,password})
                    user.save((err,data)=>{
                        if(err){
                            console.log('Error facebook login on user save',err)
                            return res.status(400).json({
                                error:'User signup failed with facebook'
                            })
                        }
                        const token=jwt.sign({_id:data._id},process.env.JWT_SECRET,{expiresIn:'7d'})
                        const{_id,email,name,role}=data
                        return res.json({
                            token,user:{_id,email,name,role}
                        })  
                    })
                }
            })
        })
        .catch(error=>{
            res.json({
                error:'Facebook login failed. Try later'
            })
        })
    )
}



















