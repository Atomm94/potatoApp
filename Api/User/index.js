const express = require('express');
const userModel = require('../../Models/models').user;
const eventModel = require('../../Models/models').event;
const verifyModel = require('../../Models/models').verifyCode;
const successHandler = require('../responseFunctions').successHandler;
const errorHandler = require('../responseFunctions').errorHandler;
const helpFunctions = require('../../helpFunctions');
const jwtAuth = require('../../jwtValidation').jwtToken;
const smsCode = require('../../sendSMS').sendSmsCode;
const smsLink = require('../../sendSMS').sendLink;
const fs = require('fs');
const uuid = require('uuid-random');
const jwt = require('jsonwebtoken')

const registerPhone = async (req,res) => {
    try {
        const phone = req.body.phoneNumber;
        const deletedUserFind = await userModel.findOne({phoneNumber: phone, delete: true});
        if (deletedUserFind) {
            const userDelete = await userModel.deleteOne({phoneNumber: phone, delete: true});
        }
        const userFind = await userModel.findOne({phoneNumber: phone, delete: false});
        if (userFind) {
            let err = {};
            err.message = "phoneNumber is duplicated!"
            return errorHandler(res, err);
        }
        const userCreate = await userModel.create({
            phoneNumber: phone,
            userName: uuid()
        });
        res.message = `You are registered your phone: ${phone}`
        return successHandler(res, userCreate);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const registerName = async (req,res) => {
    try {
        const name = req.body.name;
        const userId = req.query.userId
        const userUpdate = await userModel.updateOne({_id: userId}, {
            $set: {name: name}
        })
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "User is not find!"
            return errorHandler(res, err);
        }
        res.message = `You are registered your name: ${name}`
        return successHandler(res, userUpdate);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const registerUserName = async (req,res) => {
    try {
        const userName = req.body.userName;
        const userId = req.query.userId
        const deletedUserFind = await userModel.findOne({userName: userName, delete: true});
        if (deletedUserFind) {
            const userDelete = await userModel.deleteOne({userName: userName, delete: true});
        }
        const userFind = await userModel.findOne({userName: userName, delete: false});
        if (userFind) {
            let err = {};
            err.message = "userName is duplicated!"
            return errorHandler(res, err);
        }
        let fullUrl = req.protocol + '://' + req.get('host');
        if(req.file) {
            req.body.avatar =  fullUrl + '/' + req.file.filename;
        } else {
            req.body.avatar = 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-PNG-Icon-715x715.png'
        }
        const userUpdate = await userModel.updateOne({_id: userId}, {
            $set: {userName: userName, avatar: req.body.avatar}
        })
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "User is not find!"
            return errorHandler(res, err);
        }
        res.message = `You are registered your avatar & userName: ${userName}`
        return successHandler(res, userUpdate)
    } catch (err) {
        if (req.file) {
            let dataImages = fs.readdirSync('Media');
            if (dataImages.includes(req.file.filename)) {
                let index = dataImages.indexOf(req.file.filename)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        return errorHandler(res, err);
    }
}

const registerBirthDay = async (req,res) => {
    try {
        const birthDay = req.body.birthDay;
        const userId = req.query.userId;
        const userUpdate = await userModel.updateOne({_id: userId}, {
            $set: {birthDay: birthDay}
        })
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "User is not find!"
            return errorHandler(res, err);
        }
        res.message = `You are registered your birthday: ${birthDay}`
        return successHandler(res, userUpdate)
    } catch (err) {
        return errorHandler(res, err)
    }
}

const registerPassword = async (req,res) => {
    try {
        let {password, confirmPassword} = req.body;
        const userId = req.query.userId;
        if (confirmPassword !== password) {
            let err = {};
            err.message = 'Password and Confirm password are different'
            return errorHandler(res, err);
        }
        password = await helpFunctions.hashPassword(password);
        const userUpdate = await userModel.updateOne({_id: userId}, {
            $set: {password: password}
        })
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "User is not find!"
            return errorHandler(res, err);
        }
        const findUser = await userModel.findOne({_id: userId});
        //const code = await smsCode(findUser.phoneNumber);
        const code = 1422;
        const verifyCode = await verifyModel.create({user: findUser._id, code: code})
        findUser.verificationCode = verifyCode._id;
        await findUser.save();
        res.message = `You are registered your password: ${password}, verify your sms code`
        return successHandler(res, userUpdate)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const verifyCode = async (req,res) => {
    try {
        const {id, code} = req.query;
        const findUser = await userModel.findOne({_id: id}).populate('verificationCode');
        if (!findUser) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        if (findUser.verificationCode === null) {
            let err = {};
            await userModel.updateOne({_id: id}, {$set: {verificationCode: null}});
            err.message = 'The verification code was expired!'
            return errorHandler(res, err);
        }
        if (+code !== findUser.verificationCode.code) {
            let err = {};
            err.message = 'Invalid verification code!'
            return errorHandler(res, err);
        }
        findUser.block = false;
        await findUser.save();
        res.message = 'User was verified successfully!'
        return successHandler(res, findUser);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const login = async (req,res) => {
    try {
        const {phoneNumber, userName, password} = req.body;
        let loginObj = {};
        let userFind;
        let tok;
        loginObj.password = password;
        if (req.body.phoneNumber) {
            loginObj.phoneNumber = phoneNumber;
            userFind = await userModel.findOne({phoneNumber: loginObj.phoneNumber, delete: false})
            if (!userFind) {
                let err = {};
                err.message = "phone number is not correct!"
                return errorHandler(res, err);
            }
            userFind = await userModel.findOne({phoneNumber: loginObj.phoneNumber, delete: false, block: true})
            if (userFind) {
                let err = {};
                err.message = "This user is not verified!"
                err.data = userFind._id
                const code = await smsCode(userFind.phoneNumber);
                //const code = 1422;
                const findVerify = await verifyModel.findOne({_id: userFind.verificationCode});
                if (findVerify) {
                    await verifyModel.deleteOne({_id: userFind.verificationCode})
                }
                const verifyCode = await verifyModel.create({user: userFind._id, code: code})
                userFind.verificationCode = verifyCode._id;
                await userFind.save();
                return errorHandler(res, err);
            }

            userFind = await userModel.findOne({phoneNumber: loginObj.phoneNumber, delete: false, block: false})
            tok = {
                id: userFind._id,
                phoneNumber: userFind.phoneNumber
            }
        }
        if (req.body.userName) {
            loginObj.userName = userName;
            userFind = await userModel.findOne({userName: loginObj.userName, delete: false})
            if (!userFind) {
                let err = {};
                err.message = "nick name is not correct!"
                return errorHandler(res, err);
            }
            userFind = await userModel.findOne({userName: loginObj.userName, delete: false, block: true})
            if (userFind) {
                let err = {};
                err.message = "This user is not verified!"
                err.data = userFind._id
                const code = await smsCode(userFind.phoneNumber);
                //const code = 1422;
                const findVerify = await verifyModel.findOne({_id: userFind.verificationCode});
                if (findVerify) {
                    await verifyModel.deleteOne({_id: userFind.verificationCode})
                }
                const verifyCode = await verifyModel.create({user: userFind._id, code: code})
                userFind.verificationCode = verifyCode._id;
                await userFind.save();
                return errorHandler(res, err);
            }

            userFind = await userModel.findOne({userName: loginObj.userName, delete: false, block: false})
            tok = {
                id: userFind._id,
                userName: userFind.userName
            }
        }
        if (!userFind) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        const compare = await helpFunctions.comparePassword(password, userFind.password);
        if (!compare) {
            let err = {};
            err.message = 'Password is not correct!';
            return errorHandler(res, err);
        }
        const signToken = await jwtAuth(tok);
        userFind.token = signToken;
        await userFind.save();
        return successHandler(res, userFind)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const userGet = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jwt.decode(token);
        const userFind = await userModel.findOne({_id: decodeToken.data.id, delete: false, block: false}, {password: 0});
        if (!userFind) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const update = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jwt.decode(token);
        req.body.updatedAt = Date.now();
        const userUpdate = await userModel.updateOne({_id: decodeToken.data.id, delete: false, block: false}, req.body);
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        return successHandler(res, userUpdate);
    } catch (err) {
        return successHandler(res, err);
    }
}

const changePhoneNumber = async (req,res) => {
    try {
        const id = req.query.id;
        const phoneNumber = req.body.phoneNumber;
        const userUpdate = await userModel.updateOne({_id: id, delete: false}, {
            $set: {phoneNumber: phoneNumber, updatedAt: Date.now()}
        });
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        res.message = "the phone number is changed!"
        return successHandler(res, userUpdate);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const remove = async (req,res) => {
    try {
        const id = req.query.id;
        const userDelete = await userModel.updateOne({_id: id, delete: false, block: false}, {$set: {delete: true}});
        if (userDelete.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        return successHandler(res, userDelete);
    } catch (err) {
        return successHandler(res, err);
    }
}

const invite = async (req,res) => {
    try {
        const id = req.query.id;
        const phoneNumber = req.body.phoneNumber;
        const userFind = await userModel.findOne({_id: id, delete: false, block: false});
        if (!userFind) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        await smsLink(phoneNumber);

        res.message = "This user was invited!";
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const sendResetPasswordCode = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;
        const code = await smsCode(phoneNumber);
        //const code = 1422;
        const userFind = await userModel.findOne({phoneNumber: phoneNumber, delete: false});
        const verifyCode = await verifyModel.create({user: userFind._id, code: code})
        userFind.verificationCode = verifyCode._id;
        await userFind.save();
        res.message = "The code was sent on this phone number!"
        return successHandler(res, code);
    } catch (err) {
        return errorHandler(res, err);
    }
}



const resetPassword = async (req,res) => {
    try {
        const {id, password, confirmPassword} = req.body;
        if (password !== confirmPassword) {
            let err = {};
            err.message = 'confirm password is incorrect!';
            return errorHandler(res, err);
        }
        let newPassword = await helpFunctions.hashPassword(password);
        let updatePassword = await userModel.updateOne({_id: id, delete: false, block: false}, {
            $set: {password: newPassword}
        })
        if (updatePassword.nModified === 0) {
            let err = {};
            err.message = "Is not updated!";
            return errorHandler(res, err)
        }
        res.message = 'Password updated successfully!'
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const accessContacts = async (req,res) => {
    try {
        const contacts = req.body.contact;
        const id = req.query.id;
        let inviteUsers = [];
        let quickAddUsers = [];
        for (let i=0; i < contacts.length; i++) {
            let parseItem = JSON.parse(contacts[i])
            let phone = parseItem.phoneNumber;
            const findUser = await userModel.findOne({phoneNumber: phone, delete: false, block: false});
            if(!findUser) {
                inviteUsers.push(parseItem)
            } else {
                quickAddUsers.push(findUser._id)
            }
        }
        await userModel.updateOne({_id: id, delete: false, block: false}, {
            $set: {invite: inviteUsers, quickAdd: quickAddUsers}
        })
        const returnUsers = await userModel.findOne({_id: id}).select('invite').select('quickAdd');
        return successHandler(res, returnUsers)
    } catch (err) {
        errorHandler(res, err)
    }
}

const accessLocation = async (req,res) => {
    try {
        const coordinate = {
            lat: Number(req.body.lat),
            long: Number(req.body.long)
        };
        const id = req.query.id;
        const locateUser = { type: 'Point', coordinates: coordinate };
        const updateUser = await userModel.updateOne({_id: id, delete: false, block: false}, {
            $set: {location: locateUser}
        })
        if (updateUser.nModified === 0) {
            let err = {};
            err.message = 'location is not added!';
            return errorHandler(res, err);
        }
        return successHandler(res, updateUser);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getNotifications = async (req,res) => {
    try {
        const id = req.query.id;
        const findNotifications = await userModel.findOne({_id: id, delete: false, block: false})
            .select('notifications');
        if(!findNotifications) {
            let err = {};
            err.message = 'Notifications is not find!';
            return errorHandler(res, err);
        }
        return successHandler(res, findNotifications);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const leaveFromChat = async (req,res) => {
    try {
        const {id, eventId} = req.query;
        const updateEvent = await eventModel.updateOne({_id: eventId}, {
            $pull: {users: id}
        });
        if(updateEvent.nModified === 0) {
            let err = {};
            err.message = "User or Event is not find!";
            return errorHandler(res, err);
        }
        res.message = "Event updated successfully!"
        return successHandler(res, updateEvent);
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    registerPhone,
    registerName,
    registerUserName,
    registerBirthDay,
    registerPassword,
    verifyCode,
    login,
    userGet,
    update,
    remove,
    invite,
    sendResetPasswordCode,
    resetPassword,
    accessContacts,
    accessLocation,
    getNotifications,
    leaveFromChat,
    changePhoneNumber
}