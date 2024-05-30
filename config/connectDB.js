const mongoose =require('mongoose')


module.exports =async()=>{
try {
    await mongoose.connect(process.env.MONGO_CLAUD_URI)
    console.log("Connected to mongoDB");
    
} catch (error) {
    console.log('connection failed to mongoDB',error);
}
}