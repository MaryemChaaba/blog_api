
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middlewares/verifyToken')
const { createCommentCtrl ,getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl} = require('../controllers/commentsControler')
const validateObjectId = require('../middlewares/validateObjectId')

const router = require('express').Router()



// /api/comments
router.route('/').post(verifyToken,createCommentCtrl)
.get(verifyTokenAndAdmin,getAllCommentsCtrl)


// /api/comments/:id
router.route('/:id').delete(validateObjectId,verifyToken,deleteCommentCtrl)
.put(validateObjectId,verifyToken,updateCommentCtrl)




module.exports=router