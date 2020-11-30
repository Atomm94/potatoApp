const express = require('express');
const userModel = require('../../Models/models').user;
const verifyModel = require('../../Models/models').verifyCode;
const successHandler = require('../responseFunctions').successHandler;
const errorHandler = require('../responseFunctions').errorHandler;
const helpFunctions = require('../../helpFunctions');
const jwtAuth = require('../../jwtValidation').jwtToken;
const smsCode = require('../../sendSMS').sendSmsCode;
const smsLink = require('../../sendSMS').sendLink;
const fs = require('fs');
const uuid = require('uuid-random');

// const register = async (req,res) => {
//     try {
//         const body = req.body;
//         if(req.file) {
//             body.avatar = req.file.filename;
//         };
//         if (body.confirmPassword !== body.password) {
//             let err = {};
//             err.message = 'Password and Confirm password are different'
//             return errorHandler(res, err);
//         }
//         body.password = await helpFunctions.hashPassword(body.password);
//         const userCreate = await userModel.create(body);
//         //const code = await smsCode(userCreate.phoneNumber);
//         const code = 1422;
//         const verifyCode = await verifyModel.create({user: userCreate._id, code: code})
//         userCreate.verificationCode = verifyCode._id;
//         await userCreate.save();
//         return successHandler(res, userCreate);
//     } catch (err) {
//         if (req.file) {
//             let dataImages = fs.readdirSync('Media');
//             if (dataImages.includes(req.file.filename)) {
//                 let index = dataImages.indexOf(req.file.filename)
//                 let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
//             }
//         }
//         return errorHandler(res, err);
//     }
// }

const registerPhone = async (req,res) => {
    try {
        const phone = req.body.phoneNumber;
        console.log(phone)
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
        console.log(req.file.filename)
        if(req.file) {
            req.body.avatar = req.file.filename;
        } else if (!req.body.avatar) {
            req.body.avatar = 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-PNG-Icon-715x715.png'
        }
        else {
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
            userFind = await userModel.findOne({phoneNumber: loginObj.phoneNumber, delete: false, block: false})
            tok = {
                id: userFind._id,
                phoneNumber: userFind.phoneNumber
            }
        }
        if (req.body.userName) {
            loginObj.userName = userName;
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
        const id = req.query.id;
        const userFind = await userModel.findOne({_id: id, delete: false, block: false}, {token: 0, password: 0});
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
        const id = req.query.id;
        const userUpdate = await userModel.updateOne({_id: id, delete: false, block: false}, req.body);
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

const accept = async (req,res) => {
    try {
       const {id, friendId} = req.query;
       const userUpdate = await userModel.updateOne({_id: id, acceptFriend: friendId, delete: false, block: false}, {
           $push: {friends: friendId},
           $pull: {acceptFriend: friendId}
       });
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
       const acceptUpdate = await userModel.updateOne({_id: friendId, addFriend: id, delete: false, block: false}, {
           $push: {friends: id},
           $pull: {addFriend: id}
       })
        if (acceptUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
       res.message = 'are friends!!'
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const ignore = async (req,res) => {
    try {
        const {id, friendId} = req.query;
        const userUpdate = await userModel.updateOne({_id: id, acceptFriend: friendId, delete: false, block: false}, {
            $pull: {acceptFriend: friendId}
        });
        if (userUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        const acceptUpdate = await userModel.updateOne({_id: friendId, addFriend: id, delete: false, block: false}, {
            $pull: {addFriend: id}
        })
        if (acceptUpdate.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        res.message = 'are ignored!'
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const addFriend = async (req,res) => {
    try {
        const {id, friendId} = req.query;
        const userFind = await userModel.updateOne({_id: id, delete: false, block: false}, {$push: {addFriend: friendId}});
        if (userFind.nModified === 0) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err)
        }
        const friendFind = await userModel.updateOne({_id: friendId, delete: false, block: false}, {$push: {acceptFriend: id}});
        if (friendFind.nModified === 0) {
            let err = {};
            err.message = "Don't find this friend!";
            return errorHandler(res, err)
        }
        res.message = "You are request to add a new friend!"
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
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
        res.message = "This user ";
    } catch (err) {
        return errorHandler(res, err);
    }
}

const sendResetPasswordCode = async (req, res) => {
    try {
        const phoneNumber = req.query.phoneNumber;
        //const code = await smsCode(phoneNumber);
        const code = 1422;
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

module.exports = {
   // register,
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
    accept,
    ignore,
    addFriend,
    invite,
    sendResetPasswordCode,
    resetPassword,
    accessContacts,
    accessLocation,
    getNotifications
}