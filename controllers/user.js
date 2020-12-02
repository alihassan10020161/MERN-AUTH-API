const User=require('../models/user')

// find user
exports.read=(req,res)=>
{
    const userId=req.params.id
    // check if user exist
    User.findById(userId).exec((err,user)=>{
        if(err|| !user){
            return res.status(400).json({
                error: 'User not found'
            })
        }
        user.hased_password=undefined
        user.salt=undefined
        res.json(user)

    })
}

// update user
exports.update=(req,res)=>
{
    console.log('update user - req.user', req.user ,'update data', req.body)
    const {name,password}=req.body 
    
    User.findOne({_id: req.user._id},(err,user)=>{
        if(err|| !user){
            return res.status(400).json({
                error: 'User not found'
            })
        }
        if(!name){
            return res.status(400).json({
                error: 'Name is required'
            })
        }else{user.name=name}
        if(password){
            if(password.length<6){
                return res.status(400).json({
                    error: 'Password should be min 6 charcters long'
                })
            }else{user.password=password}
        }
            user.save((err,updatedUser)=>{
                if(err){
                    return res.status(400).json({
                    error: 'User update failed'
                    })
                }
            updatedUser.hased_password=undefined
            updatedUser.salt=undefined
            res.json(updatedUser)
            })
        
    })   
}