const mongoose= require('mongoose')
const Joi = require ('joi')


// category Schema 
const categorySchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    
    title:{
        type:String,
        required:true,
        trim:true
    }
   
},{
    timestamps:true
})


// Comment model 
const Category= mongoose.model("Category",categorySchema)



// validate create category 
function vaidateCreateCategory (obj){
    const schema = Joi.object({
        title:Joi.string().trim().required()
    })
    return schema.validate(obj)
}



module.exports={
    Category,
    vaidateCreateCategory
}