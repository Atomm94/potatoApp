const express = require('express');
const eventModel = require('../../Models/models').event;
const userModel = require('../../Models/models').user;
const chatModel = require('../../Models/models').chat;
const successHandler = require('../responseFunctions').successHandler;
const errorHandler = require('../responseFunctions').errorHandler;
const helpFunctions = require('../../helpFunctions');
const multer = require('multer');
const uploadImage = require('../../uploadFile');
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
        const createEvent = await eventModel.create(evObj);
        evObj.users.map(async item => {
            await userModel.updateOne({_id: item, delete: false, block: false}, {
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
        const userFind = await userModel.findOne({_id: id, delete: false, block: false})
        if (!userFind) {
            let err = {};
            err.message = "Don't find this user!";
            return errorHandler(res, err);
        }
        if (!userFind.events) {
            let err = {};
            err.message = "Don't find events whit this user!";
            return errorHandler(res, err);
        }
        const events = await userModel.findOne({_id: id}).select('events').populate('events');
        return successHandler(res, events)
    } catch (err) {
        return errorHandler(res, err)
    }
}

const getEvent = async (req,res) => {
    try {
        const id = req.query.id;
        const eventFind = await eventModel.findOne({_id: id, delete: false});
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

const deleteEvent = async (req,res) => {
    try {
        const id = req.query.id;
        const removeEvent = await eventModel.updateOne({_id: id, delete: false}, {
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
    getEvent,
    deleteEvent
}