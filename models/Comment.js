const mongoose= require('mongoose')
const Joi = require ('joi')


// comment Schema 
const commentSchema = mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
},{
    timestamps:true
})


// Comment model 
const Comment= mongoose.model("Comment",commentSchema)



// validate create comment 
function vaidateCreateComment (obj){
    const schema = Joi.object({
        postId:Joi.string().required().label('Post Id'),
        text:Joi.string().trim().required()
    })
    return schema.validate(obj)
}

// validate update comment 
function vaidateUpdateComment (obj){
    const schema = Joi.object({
        text:Joi.string().trim().required()
    })
    return schema.validate(obj)
}

module.exports={
    Comment,
    vaidateCreateComment,
    vaidateUpdateComment
}