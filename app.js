const express =require('express')
const connectDb =require ('./config/connectDB')
const { errorHandler, notFound } = require('./middlewares/error')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiting = require("express-rate-limit")
const helmet = require ("helmet")
const hpp = require("hpp")
require('dotenv').config()


// Connection to DB 
connectDb()

// Init App 
const app= express()

// Middlewares 
app.use(express.json())
// prevent xss (cross site scripting) attacks
app.use(xss())
// rateLimitng
app.use(rateLimiting({
    windowMs:10*6*1000,  //10minits
    max:200
}))

app.use(helmet())
// prevent http param pollotion
app.use(hpp())


// Cors Policy 
app.use(cors({
    origin:"*"
}))

// Routes 
app.use("/api/auth",require('./routes/authRoute'))
app.use("/api/users",require('./routes/usersRoute'))
app.use("/api/posts",require('./routes/postsRoute'))
app.use("/api/comments",require('./routes/commentsRoute'))
app.use("/api/categories",require('./routes/categoriesRoute'))
app.use("/api/password",require('./routes/passwordRoute'))

// error handler middleware
app.use(notFound)
app.use(errorHandler)

app.listen(process.env.PORT,()=>{
    console.log('Server is runneing');
})