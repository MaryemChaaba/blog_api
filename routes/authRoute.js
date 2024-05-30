const router = require('express').Router()
const { registerUserCtrl, loginUserCtrl, veerifyUserAccountCtr} = require('../controllers/authController')



// api/auth/register
router.post('/register',registerUserCtrl)

// api/auth/login
router.post('/login',loginUserCtrl)

// /api/auth/:userId/verify/:token
router.get('/:userId/verify/:token',veerifyUserAccountCtr)


module.exports =router;
