const asyncHandler = require("express-async-handler")
const { Comment,vaidateCreateComment,vaidateUpdateComment } = require('../models/Comment')
const { User } = require('../models/User')



/**----------------------
*@desc Create comment
*@route /api/comments
*@method POST
*@access Private 'only loggedin user
-----------------------*/

module.exports.createCommentCtrl=asyncHandler(async(req,res)=>{
    console.log(req.body);
    const {error} =vaidateCreateComment(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const profile = await User.findById(req.user.id)

    const comment =await Comment.create({
        postId:req.body.postId,
        text:req.body.text,
        user:req.user.id,
        userName:profile.username
    })

    res.status(200).json(comment)



})

/**----------------------
*@desc Get all comments
*@route /api/comments
*@method GET
*@access Private (only admin)
-----------------------*/

module.exports.getAllCommentsCtrl=asyncHandler(async(req,res)=>{
    const comments = await Comment.find().populate('user')

    res.status(200).json(comments)



})



/**----------------------
*@desc delete comment
*@route /api/comments/:id
*@method delete
*@access Private (only admin or owner of the comment)
-----------------------*/

module.exports.deleteCommentCtrl=asyncHandler(async(req,res)=>{
    const comment = await Comment.findById(req.params.id)

    // res.status(200).json(comment)


    if(!comment){
        return res.status(404).json({"message":'commeny not found'})
    }


    if(req.user.isAdmin || comment.user.toString() ==req.user.id){


    const comment = await Comment.findByIdAndDelete(req.params.id)

         res.status(200).json(comment)
        
    }
    else{
        res.status(403).json({"message":'Access denied, not alowed'})

    }


})



/**----------------------
*@desc update comment
*@route /api/comments/:id
*@method PUT
*@access Private (only  owner of the comment)
-----------------------*/

module.exports.updateCommentCtrl=asyncHandler(async(req,res)=>{

    const {error} = vaidateUpdateComment(req.body)

    if (error){
        return res.status(400).json({"message":error.details[0].message})
    }
    const comment = await Comment.findById(req.params.id)

    // res.status(200).json(comment)


    if(!comment){
        return res.status(404).json({"message":'commeny not found'})
    }


    if( comment.user.toString() ==req.user.id){


    const updatedComment = await Comment.findByIdAndUpdate(req.params.id,{
        $set:{
          text:req.body.text
        }},{new:true})

         res.status(200).json(updatedComment)
        
    }
    else{
        res.status(403).json({"message":'Access denied, not alowed'})

    }


})