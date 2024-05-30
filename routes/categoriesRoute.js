
const router = require('express').Router()
const { registerUserCtrl, loginUserCtrl} = require('../controllers/authController');
const { createCategoryCtrl, updateCategoryCtrl, deleteCategoryCtrl, getAllCategoriesCtrl } = require('../controllers/categoryController');
const validateObjectId = require('../middlewares/validateObjectId');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');



// api/categories
router.route('/').post(verifyTokenAndAdmin,createCategoryCtrl)
.get(getAllCategoriesCtrl)

// api/categories/:id
router.route('/:id').put(validateObjectId,verifyTokenAndAdmin,updateCategoryCtrl)
.delete(validateObjectId,verifyTokenAndAdmin,deleteCategoryCtrl)

module.exports =router;
