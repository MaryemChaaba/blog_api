const mongoose= require('mongoose')


// verification token Schema 
const VerificationTokenSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    
    token:{
        type:String,
        required:true
    }
   
},{
    timestamps:true
})


// verification token model 
const VerificationToken= mongoose.model("Verification",VerificationTokenSchema)






module.exports=VerificationToken;    