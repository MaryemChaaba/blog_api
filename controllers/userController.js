const asyncHandler = require('express-async-handler')
const { User, validateUpdateUser } = require('../models/User')
const { Post } = require('../models/Post')
const { Comment } = require('../models/Comment')
const bcrypt =require('bcryptjs')
const path=require('path')
const fs =require('fs')

const { cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultiple } =require('../utils/cloudinary')


/*----------------------
*@desc Get all usersprofile
*@route /api/users/profile
*@method GET
*@access Private (only admin)
-----------------------*/

module.exports.getAllUsersCtrl=asyncHandler(async(req,res)=>{
   
    const users = await User.find().select('-password').populate('posts')
    res.status(200).json(users)
})


/**----------------------
*@desc Get user profile
*@route /api/users/profile/:id
*@method GET
*@access Public
-----------------------*/

module.exports.getUserProfileCtrl=asyncHandler(async(req,res)=>{
   
    const user = await User.findById(req.params.id).select('-password').populate('posts')
    if(!user){
        res.status(404).json({message:"User not found"})
    }
    res.status(200).json(user)
})


/*----------------------
*@desc update user profile
*@route /api/users/profile/:id
*@method Put
*@access Private (only user himself)
-----------------------*/

module.exports.updateUserProfileCtrl=asyncHandler(async(req,res)=>{
    // validation
    const {error} = validateUpdateUser(req.body)
    if (error){
        res.status(400).json({message:error.details[0].message})
    }

    if(req.body.password){
        const salt =await bcrypt.genSalt(10)
        req.body.password =await bcrypt.hash(req.body.password,salt)
    }
   
    const updatedUser =await User.findByIdAndUpdate(req.params.id,{
     $set:{
        username:req.body.username,
        password:req.body.password,
        bio:req.body.bio
     }
    },{new:true}).select('-password')
    .populate('posts')
    res.status(200).json(updatedUser)
})


/*----------------------
*@desc Get users Count
*@route /api/users/count
*@method GET
*@access Private (only admin)
-----------------------*/

module.exports.getUsersCountCtrl=asyncHandler(async(req,res)=>{
   
    const count = await User.countDocuments({});
    res.status(200).json(count)
})


/*----------------------
*@desc Profile photo upload
*@route /api/users/profile-photo-upload
*@method POST
*@access Only logged in user
-----------------------*/

module.exports.profilePhotoUploadCtrl=asyncHandler(async(req,res)=>{
    // 1 validation
   if(!req.file){
    return res.status(400).json({message:"No file provided"})
   }
//    2 get the path to the image
const imagePath =path.join(__dirname,`../images/${req.file.filename}`)
// 3 upload to cloudinary
const result = await cloudinaryUploadImage(imagePath)
console.log(result);
// 4 get the user from db
const user = await User.findById(req.user.id)
// 5 delete the old photo profile if exist 
if(user.profilePhoto.publicId !== null){
    await cloudinaryRemoveImage(user.profilePhoto.publicId)
}
// 6 change the profilephoto filed in the db
user.profilePhoto={
    url:result.secure_url,
    publicId:result.public_id
}
await user.save()
// 7 send response to the client
    res.status(200).json({
        message:'Your profile photo uploaded successfully',
        profilePhoto:{url:result.secure_url, public_id:result.public_id}
    
    })

    // 8remove image from the server
    fs.unlinkSync(imagePath)
})


/*----------------------
*@desc Delete user profile (account)
*@route /api/users/:id
*@method DELETE
*@access Private (only user himself or admin)
-----------------------*/

module.exports.deleteUserProfileCtrl=asyncHandler(async(req,res)=>{
   
    // 1. get the user from DB
    const user = await User.findById(req.params.id)
    if(!user){
        return res.status(400).json({message:'user not found'})
    }
    // 2. get all posts from db
    const deletedPosts = await Post.find({user:user._id})
    // 3. get the public ids from the posts
    const  publicIds= deletedPosts?.map(dp=>dp.image.publicId)
    // 4. delete al posts images from the cloudinary that belongs to the user
    if(publicIds?.length>0){
        await cloudinaryRemoveMultiple(publicIds)
    }
    // 5. delete the profile picture from cloudinary
    if (user.profilePhoto.publicId!==null) {
        
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }
    // 6. delete user posts and comment
    await Post.deleteMany({user:user._id})
    await Comment.deleteMany({user:user._id})
    
    // 7. delete the user himself
    await User.findByIdAndDelete(req.params.id)
    // 8 send a response to the client
    res.status(200).json({message:'your profile has been deleted'})
    
})
