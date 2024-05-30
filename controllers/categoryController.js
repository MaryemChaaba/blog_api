const asyncHandler = require("express-async-handler")
const { Category,vaidateCreateCategory} = require('../models/Category')



/**----------------------
*@desc Create category
*@route /api/categories
*@method POST
*@access Private 'only admin '
-----------------------*/

module.exports.createCategoryCtrl=asyncHandler(async(req,res)=>{
    const {error} =vaidateCreateCategory(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    const category =await Category.create({
        
        title:req.body.title,
        user:req.user.id
    })

    res.status(200).json(category)



})

/**----------------------
*@desc Get all categories
*@route /api/categories
*@method GET
*@access Private (only admin)
-----------------------*/

module.exports.getAllCategoriesCtrl=asyncHandler(async(req,res)=>{
    const categories = await Category.find().populate('user')

    res.status(200).json(categories)



})



/**----------------------
*@desc delete category
*@route /api/categories/:id
*@method delete
*@access Private (only admin)
-----------------------*/

module.exports.deleteCategoryCtrl=asyncHandler(async(req,res)=>{
    const category = await Category.findById(req.params.id)



    if(!category){
        return res.status(404).json({"message":'category not found'})
    }




    const deletedCategory = await Category.findByIdAndDelete(req.params.id)

         res.status(200).json({"message":'Comment has been deleted'})
        
   


})



/**----------------------
*@desc update Category
*@route /api/categories/:id
*@method PUT
*@access Private (only  admin)
-----------------------*/

module.exports.updateCategoryCtrl=asyncHandler(async(req,res)=>{


    const category = await Category.findById(req.params.id)




    if(!category){
        return res.status(404).json({"message":'Category not found'})
    }

    const updatedCategory= await Category.findByIdAndUpdate(req.params.id,{
        $set:{
          title:req.body.title
        }},{new:true})

         res.status(200).json(updatedCategory)
        
    

})