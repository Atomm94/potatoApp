const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

const registerSchema = Joi.object({
    avatar: Joi.string(),
    name: Joi.string(),
    userName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    birthDay: Joi.string().required(),
    password: Joi.string().min(3).required(),
    confirmPassword: Joi.string().min(3).required()
})

const phone_number = Joi.object({
    phoneNumber: Joi.string().required()
})

const name = Joi.object({
    name: Joi.string().required()
})

const user_name = Joi.object({
    avatar: Joi.string(),
    userName: Joi.string().required()
})

const birth_day = Joi.object({
    birthDay: Joi.string().required()
})

const password = Joi.object({
    password: Joi.string().min(3).required(),
    confirmPassword: Joi.string().min(3).required()
})

const loginSchema = Joi.object({
    userName: Joi.string(),
    phoneNumber: Joi.string(),
    password: Joi.string().min(3).required()
})

const phoneNumberValidation = validator.body(phone_number);
const nameValidation = validator.body(name);
const userNameValidation = validator.body(user_name);
const birthDayValidation = validator.body(birth_day);
const passwordValidation = validator.body(password);
const loginValidation = validator.body(loginSchema);

module.exports = {
    //registerValidation,
    phoneNumberValidation,
    nameValidation,
    userNameValidation,
    birthDayValidation,
    passwordValidation,
    loginValidation
}