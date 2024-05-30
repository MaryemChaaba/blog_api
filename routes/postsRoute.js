const router = require('express').Router()
const { verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifyToken')
const photoUpload = require('../middlewares/photoUpload')
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, updateImagePostCtrl, toggelLikeCtrl } = require('../controllers/postsController')
const validateObjectId = require('../middlewares/validateObjectId')


//  /api/posts
router.route('/')
   .post(verifyToken,photoUpload.single("image"),createPostCtrl)
   .get(getAllPostsCtrl)


   
   //  /api/posts/count
   router.route('/count')
   .get(getPostCountCtrl)

   //  /api/posts/:id
router.route('/:id')
.get(validateObjectId,getSinglePostCtrl)
.delete(validateObjectId,verifyToken,deletePostCtrl)
.put(validateObjectId,verifyToken,updatePostCtrl)



  //  /api/posts/upload-image/:id
  router.route('/upload-image/:id')
  .put(validateObjectId,verifyToken,photoUpload.single('image'),updateImagePostCtrl)
  

  //  /api/posts/upload-image/:id
  router.route('/like/:id')
  .put(validateObjectId,verifyToken,toggelLikeCtrl)
  
   
module.exports =router