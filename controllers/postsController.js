const fs = require('fs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const { Post,validateCreatePost, validateUpdatePost } = require ('../models/Post')
const { Comment } = require ('../models/Comment')
const { cloudinaryUploadImage ,cloudinaryRemoveImage } = require('../utils/cloudinary')
const { validateHeaderValue } = require('http')



/**----------------------
*@desc create new post
*@route /api/post
*@method POST
*@access Private (only loggedin user)
-----------------------*/

module.exports.createPostCtrl=asyncHandler(async(req,res)=>{
    // 1.validation for image
    if (!req.file){
        return res.status(400).json({message:'no image provided'})
    }
    // 2. validation for data
 

    const {error} = validateCreatePost(req.body)
    if (error){
        return res.status(400).json({message:error.details[0].message})
    }
    //3. upload photo
    const imagePath =path.join(__dirname,`../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)
    // 4. create new post and save it to db
    const post =await Post.create({
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        user:req.user.id,
        image:{
            url:result.secure_url,
            publicId:result.public_id
        }
    })


    // 5. send response to the client
    res.status(201).json(post)
    // 6.remove image from the server
    fs.unlinkSync(imagePath);
    
})


/**----------------------
*@desc get all posts
*@route /api/post
*@method GET
*@access Public
-----------------------*/

module.exports.getAllPostsCtrl=asyncHandler(async(req,res)=>{
     const POST_PER_PAGE =3;
     const {pageNumber,category}= req.query
     let posts;
     if (pageNumber) {
        posts =await Post.find()
                .skip((pageNumber-1)* POST_PER_PAGE)
                .limit(POST_PER_PAGE).sort({createdAt:-1}).populate('user',["-password"])
     }else if (category) {
        posts = await Post.find({category}).sort({createdAt:-1}).populate('user',["-password"])
     } else {
        posts = await Post.find().sort({createdAt:-1}).populate('user',["-password"])
     }

     res.status(200).json(posts)
})






/**----------------------
*@desc get single post
*@route /api/post/:id
*@method GET
*@access Public
-----------------------*/

module.exports.getSinglePostCtrl=asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id).populate('user',["-password"])
    .populate('comments')

    if (!post){
        return res.status(404).json({message:'Post not found'})
    }
    res.status(200).json(post)
})




/**----------------------
*@desc get post count
*@route /api/post/count
*@method GET
*@access Public
-----------------------*/

module.exports.getPostCountCtrl=asyncHandler(async(req,res)=>{
    const count = await Post.countDocuments({});
    res.status(200).json(count)
})

/**----------------------
*@desc delete post 
*@route /api/post/:id
*@method delete
*@access private (only admin or owner of the post)
-----------------------*/

module.exports.deletePostCtrl=asyncHandler(async(req,res)=>{
    const post = await Post.findById(req.params.id).populate('user',["-password"])

    if (!post){
        return res.status(404).json({message:'Post not found'})
    }
   console.log(req.user);
    if(req.user.isAdmin || req.user.id===post.user){

        const deetedPost = await Post.findByIdAndDelete(req.params.id);
        if (post?.image?.publicId) {
            
            await cloudinaryRemoveImage(post?.image?.publicId)
        }
        const deleteComments = await Comment.deleteMany({"postId":post._id})
        res.status(200).json(deetedPost)
    }
})


/**----------------------
*@desc update post 
*@route /api/post/:id
*@method PUT
*@access private (only owner of the post)
-----------------------*/

module.exports.updatePostCtrl=asyncHandler(async(req,res)=>{
    
    // 1.validation 
    const {error} = validateUpdatePost(req.body)

    if (error){
        return res.status(400).json({message:error.details[0].message})
    }


    // 2. get the post from db and check if post exist 
    const post = await Post.findById(req.params.id).populate('user',["-password"])

    if (!post){
        return res.status(404).json({message:'Post not found'})
    }
    
    // 3.check if the post belong to the loggedin user 
    if( req.user.id!==post.user._id.toString()){
        return res.status(403).json({message:'access denied, you are not allowed'})
    }
    const updateddPost = await Post.findByIdAndUpdate(req.params.id,{
           $set:{
            title:req.body.title,
            description:req.body.description,
            category:req.body.category
           } },{new:true}).populate('user',['-password']);
       

        // 4.sen response to client 
        res.status(200).json(updateddPost)
})



/**----------------------
*@desc update post image
*@route /api/post/upload-image/:id
*@method PUT
*@access private (only owner of the post)
-----------------------*/

module.exports.updateImagePostCtrl=asyncHandler(async(req,res)=>{
        // 1 validation
   if(!req.file){
    return res.status(400).json({message:"No file provided"})
   }


    // 2. get the post from db and check if post exist 
    const post = await Post.findById(req.params.id).populate('user',["-password"])

    if (!post){
        return res.status(404).json({message:'Post not found'})
    }
    
    // 3.check if the post belong to the loggedin user 
    if( req.user.id!==post.user._id.toString()){
        return res.status(403).json({message:'access denied, you are not allowed'})
    }

    // 4 delete the old photo post if exist 
if(post.image.publicId !== null){
    await cloudinaryRemoveImage(post.image.publicId)
}

//    5 get the path to the image
const imagePath =path.join(__dirname,`../images/${req.file.filename}`)
// 6 upload to cloudinary
const result = await cloudinaryUploadImage(imagePath)


// 7 change the post photo filed in the db
post.image={
    url:result.secure_url,
    publicId:result.public_id
}
await post.save()
// 8 send response to the client
    res.status(200).json(post)

    // 8remove image from the server
    fs.unlinkSync(imagePath)

})



/**----------------------
*@desc Toggel like
*@route /api/post/like/:id
*@method PUT
*@access private (only ogged in user)
-----------------------*/

module.exports.toggelLikeCtrl=asyncHandler(async(req,res)=>{
    const loggedInUser =req.user.id
    const {id:postId} = req.params
  let post =await Post.findById(postId)
  if(!post){
    return res.status(404).json({message:'post not found'})
  }

  const isPostAlreadyLiked = post.likes.find(user=>user.toString()===loggedInUser)

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(postId,{
        $pull:{likes:loggedInUser}
    },{new:true})
  }else{
    post = await Post.findByIdAndUpdate(postId,{
        $push:{likes:loggedInUser}
    },{new:true})
  }

res.status(200).json(post)
})