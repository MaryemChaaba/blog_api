const router = require('express').Router();
const { resetPasswordCtrl, getResetPasswordLinkCtrl } = require('../controllers/PasswordController');



// /api/password/reset-password-link
router.post('/reset-password-link',resetPasswordCtrl)


// /api/password/reset-password/:userId/:token
router.route('/reset-password/:userId/:token').get(getResetPasswordLinkCtrl).post(resetPasswordCtrl)

module.exports =router