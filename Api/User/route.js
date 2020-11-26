const express = require('express');
const user = express();
const uploadImage = require('../../uploadFile');
const multer = require('multer');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
const validation = require('./validation');
const controllers = require('./index');

//user.post('/register', upload, validation.registerValidation, controllers.register)
user.post('/registerPhone',  validation.phoneNumberValidation, controllers.registerPhone)
user.post('/registerName', validation.nameValidation, controllers.registerName)
user.post('/registerUserName', upload, validation.userNameValidation, controllers.registerUserName)
user.post('/registerBirthDay', validation.birthDayValidation, controllers.registerBirthDay)
user.post('/registerPassword', validation.passwordValidation, controllers.registerPassword)
user.post('/login', validation.loginValidation, controllers.login)
user.put('/verifyCode', controllers.verifyCode)
user.get('/log', controllers.userGet)
user.put('/log/update',upload, controllers.update)
user.delete('/log/delete', controllers.remove)
user.put('/log/accept', controllers.accept)
user.put('/log/ignore', controllers.ignore)
user.put('/log/addFriend', controllers.addFriend)
user.post('/log/invite', controllers.invite)
user.put('/sendResCode', controllers.sendResetPasswordCode)
user.put('/log/resetPassword', controllers.resetPassword)
user.post('/accessContacts', controllers.accessContacts)
user.post('/accessLocation', controllers.accessLocation)
user.get('/getNotifications', controllers.getNotifications)

module.exports = {
    user
}