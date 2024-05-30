const asyncHandler= require('express-async-handler')
const bcrypt = require('bcryptjs')
const { User,validateRegisterUser, validateLoginUser } =require('./../models/User');
const VerificationToken = require('./../models/VerificationToken');
const crypto = require ('crypto')
const sendEmail = require('../utils/sendEmail')



/**----------------
*@Desc Register New User
*@router /api/auth/register
*@method POST
*@access public
------------------*/

module.exports.registerUserCtrl =asyncHandler(async(req,res)=>{
    //  validation
    const { error } = validateRegisterUser(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    // is user already exists
    let user =await User.findOne({email:req.body.email})
    if (user){
        return res.status(400).json({message:"user already exist"})
    }
    // hash the password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password,salt)

    // new user and save it to DB
    user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashPassword,
    })
    await user.save()

    // creating new verification token and save it to db
    const verificationToken =new VerificationToken({user:user._id,token:crypto.randomBytes(32).toString('hex')})
    await verificationToken.save();
    // making the link
    const link=`${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`
    // putting the link into an html template 
    const htmlTemplate =`
    <div>
    <p>Click to the link below to verify your email</p>
    <a href="${link}">
    Verify
    </a>
    </div>
    `
    // sending email to the user

    await sendEmail(user.email,'Verify Your Email',htmlTemplate)
    // send response to client
    res.status(201).json({message:'We sent to you an email, Please verify your email adress'})

    

});



/*-------------
*@desc Login user
*@route /api/auth/login
*@method POST
*@access Public
---------------------*/
module.exports.loginUserCtrl=asyncHandler(async(req,res)=>{
    // validation
    const { error } = validateLoginUser(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    // is user exist
    const user =await User.findOne({email:req.body.email})
    if (!user){
        return res.status(400).json({message:"Invalid email or password"})
    }
    // check the password 
    const isPasswordMatch =await bcrypt.compare(req.body.password,user.password)

    if (!isPasswordMatch){
        return res.status(400).json({message:"Invalid email or password"})
    }
    // send email (verify account if not verified)
    if (!user.isAccountVerified) {
        let verificationToken =await VerificationToken.findOne({user:user._id})
    // const user =await User.findOne({email:req.body.email})

        if (!verificationToken) {
            verificationToken = new VerificationToken({
                user:user._id,
                token:crypto.randomBytes(32).toString('hex')
            })
            await verificationToken.save()
        }
        console.log('tokin: '+verificationToken.token);
            // making the link
    const link=`${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`
    // putting the link into an html template 
    const htmlTemplate =`
    <div>
    <p>Click to the link below to verify your email</p>
    <a href="${link}">
    Verify
    </a>
    </div>
    `
    // sending email to the user

    await sendEmail(user.email,'Verify Your Email',htmlTemplate)
    res.status(400).json({message:'We sent to you an email, Please verify your email adress'})

    }

    // generate token
    const token =user.generateAuthToken()
    // response to client 
    res.status(200).json({
        id:user._id,
        isAdmin:user.isAdmin,
        profilePhoto:user.profilePhoto,
        token,
        username:user.username
    })
})


/**-------------
*@desc verify  user
*@route /api/auth/:userId/verify/:token
*@method GET
*@access Public
---------------------*/


module.exports.veerifyUserAccountCtr=asyncHandler(async(req,res)=>{

    const user = await User.findById(req.params.userId)
    if (!user) {
        res.status(400).json({message:'Invalid Link'})
        
    }

    const verificationToken = await VerificationToken.findOne({
        user:req.params.userId,
        token:req.params.token
})
    if (!verificationToken) {
        res.status(400).json({message:'Invalid Link'})
        
    }

    user.isAccountVerified=true
    await user.save();


    await verificationToken.remove()

    res.status(200).json({message:'Your account verified'})


})