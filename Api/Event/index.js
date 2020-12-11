const Models = require('../../Models/models');
const successHandler = require('../responseFunctions').successHandler;
const errorHandler = require('../responseFunctions').errorHandler;
const helpFunctions = require('../../helpFunctions');
const jwtAuth = require('../../jwtValidation').jwtToken;
const smsCode = require('../../sendSMS').sendSmsCode;
const fs = require('fs');

const newEvent = async (req,res) => {
    try {
        const evObj = {
            name: req.body.name,
            where: req.body.where,
            when: req.body.when,
            users: req.query.users
        }
        const createEvent = await Models.event.create(evObj);
        evObj.users.map(async item => {
            await Models.user.updateOne({_id: item, delete: false, block: false}, {
                $push: {events: createEvent._id}
            })
        })
        return successHandler(res, createEvent);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getUserEvents = async (req,res) => {
    try {
        const id = req.query.id;
        const userFind = await Models.user.findOne({_id: id, delete: false, block: false})
        if (!userFind) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err);
        }
        if (!userFind.events) {
            let err = {};
            err.message = "Don't find events with this user!";
            return errorHandler(res, err);
        }
        const events = await Models.user.findOne({_id: id}).select('events').populate('events');
        return successHandler(res, events)
    } catch (err) {
        return errorHandler(res, err)
    }
}

const getEvent = async (req,res) => {
    try {
        const id = req.query.id;
        const eventFind = await Models.event.findOne({_id: id, delete: false});
        if (!eventFind) {
            let err = {};
            err.message = "Don't find this event!";
            return errorHandler(res, err);
        }
        return successHandler(res, eventFind)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getMessages = async (req,res) => {
    try {
        const chatId = req.query.chatId;
        const findChat = await Models.chat.findOne({_id: chatId}, {_id: 0, event: 0}).populate('messages.senderId', {avatar: 1, name: 1});
        if (!chatId) {
            let err = {};
            err.message = "Chat is not find!";
            return errorHandler(res, err);
        }
        res.message = "All messages!";
        return successHandler(res, findChat)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const deleteEvent = async (req,res) => {
    try {
        const id = req.query.id;
        const removeEvent = await Models.event.updateOne({_id: id, delete: false}, {
            $set: {delete: true}
        })
        if (removeEvent.nModified === 0) {
            let err = {};
            err.message = "Don't find this event!";
            return errorHandler(res, err);
        }
        res.message = "This event was deleted successfully!";
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    newEvent,
    getUserEvents,
    getMessages,
    getEvent,
    deleteEvent
}