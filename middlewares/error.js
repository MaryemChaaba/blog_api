// Not Found mddleware 
const notFound=(req,res,next)=>{
    const error = new Error(`NotFound ${req.originalUrl}`)
    res.status(404)
    next(error)

}


// Error handler mddleware 
const errorHandler=(err,req,res,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message:err.message,
        stack:process.env.NOD_ENV === "production" ? null : err.stack 
    })

}

module.exports={
    errorHandler,notFound
}