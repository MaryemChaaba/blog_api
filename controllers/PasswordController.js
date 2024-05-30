const asyncHandler= require('express-async-handler')
const bcrypt = require('bcryptjs')
const { User,validateEmail, validateNewPassword } =require('./../models/User');
const VerificationToken = require('../models/VerificationToken');
const crypto = require ('crypto')
const sendEmail = require('../utils/sendEmail');



/**----------------
*@Desc Send reset password link
*@router /api/password/reset-password-link
*@method POST
*@access public
------------------*/


module.exports.sendPasswordLinkCtrl=asyncHandler(async(req,res)=>{
    //1 validation
    const {error} = validateEmail(req.body)
    if (error) {
        res.status(400).json({messae:error.details[0].message})
    }
    // 2 get the user from db by sendEmail
    const user = await User.findOne({email:req.body.email})
    if (!user) {
        res.status(400).json({messae:'User with given email does not exist!'})
    }
    // 3 creating verification Token
    let verificationToken = await VerificationToken.findOne({user:user._id})
    if (!verificationToken) {
        verificationToken =  new VerificationToken({user:user._id,token:crypto.randomBytes(32).toString('hex')})
        res.status(400).json({messae:error.details[0].message})
        await verificationToken.save()
    }
    // 4 creating link
    // 5 creating html trmplate
    // 6 sending EmAIL
    // 7 response to the client

    const link=`${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`
    // putting the link into an html template 
    const htmlTemplate =`
    <div>
    <p>Click to the link below to reset your email</p>
    <a href="${link}">
    Verify
    </a>
    </div>
    `
    // sending email to the user

    await sendEmail(user.email,'Reset Password',htmlTemplate)
    // send response to client
    res.status(200).json({message:'We sent to you the link to reset your password, Please verify your email adress'})

    
})

/**----------------
*@Desc Get resetpassword link
*@router /api/password/reset-password/:userId/:token
*@method GET
*@access public
------------------*/

module.exports.getResetPasswordLinkCtrl =asyncHandler(async(req,res)=>{

    const {user} = await User.findById(req.params.userId)
    if (!user) {
        res.status(400).json({messae:'Invalid link'})
    }

    let verificationToken = await VerificationToken.findOne({user:user._id,token:req.params.token})
     if (!verificationToken) {
        res.status(400).json({messae:'Invalid link'})

        
     }

    res.status(200).json({message:'Valid Url'})


     
})



/**----------------
*@Desc  resetpassword 
*@router /api/password/reset-password/:userId/:token
*@method POST
*@access public
------------------*/

module.exports.resetPasswordCtrl =asyncHandler(async(req,res)=>{


     //1 validation
     const {error} = validateNewPassword(req.body)
     if (error) {
         res.status(400).json({messae:error.details[0].message})
     }
     // 2 get the user from db by sendEmail
     const user = await User.findOne({email:req.params.userId})
     if (!user) {
         res.status(400).json({messae:'Invalid Link'})
     }
     // 3 creating verification Token
     let verificationToken = await VerificationToken.findOne({user:user._id,token:req.params.token})
     if (!verificationToken) {
         res.status(400).json({messae:'Invalid Link'})
     }
     if (!user.isAccountVerified) {
        user.isAccountVerified=true
     }

     
    // hash the password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password,salt)


    user.password= hashPassword;
    await user.save()

   
    await verificationToken.remove()
    res.status(200).json({message:'Password reset successfully, Please log in'})


     
})