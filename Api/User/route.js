const express = require('express');
const user = express();
const uploadImage = require('../../uploadFile');
const multer = require('multer');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
const validation = require('./validation');
const controllers = require('./index');

//user.post('/register', upload, validation.registerValidation, controllers.register)
user.get('/log', controllers.userGet)
user.get('/getNotifications', controllers.getNotifications)
user.post('/log/invite', controllers.invite)
user.post('/registerPhone',  validation.phoneNumberValidation, controllers.registerPhone)
user.post('/registerName', validation.nameValidation, controllers.registerName)
user.post('/registerUserName', upload, validation.userNameValidation, controllers.registerUserName)
user.post('/registerBirthDay', validation.birthDayValidation, controllers.registerBirthDay)
user.post('/registerPassword', validation.passwordValidation, controllers.registerPassword)
user.post('/login', validation.loginValidation, controllers.login)
user.post('/accessContacts', controllers.accessContacts)
user.post('/accessLocation', controllers.accessLocation)
user.put('/changeNumber', controllers.changePhoneNumber);
user.put('/verifyCode', controllers.verifyCode)
user.put('/log/update',upload, controllers.update)
user.put('/leaveFromChat', controllers.leaveFromChat)
user.put('/sendResCode', controllers.sendResetPasswordCode)
user.put('/log/resetPassword', controllers.resetPassword)
user.delete('/log/delete', controllers.remove)

module.exports = {
    user
}