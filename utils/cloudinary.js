const cloudinary = require("cloudinary")



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_ClOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const cloudinaryUploadImage =async(fileUpload)=>{
    try {
        const data =await cloudinary.uploader.upload(fileUpload,{
            resource_type:'auto'
        })
        return data
    } catch (error) {
        throw new Error('Internal Server Error (claudinary)')
    }
}


const cloudinaryRemoveImage =async(imagePublicId)=>{
    try {
        const result =await cloudinary.uploader.destroy(imagePublicId)
        return result
    } catch (error) {
        throw new Error('Internal Server Error (claudinary)')

    }
}

const cloudinaryRemoveMultiple =async(PublicIds)=>{
    try {
        const result =await cloudinary.v2.api.delete_resources(PublicIds)
        return result
    } catch (error) {
        throw new Error('Internal Server Error (claudinary)')

    }
}


module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultiple
}