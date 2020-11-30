const Chat = require('./Models/models').chat;
const mongoose = require('mongoose');
const Event = require('./Models/models').event;
const socketio = require("socket.io");
const userModel = require('./Models/models').user;
const Schema = mongoose.Schema;

exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socketIDsObject[userID]= id
        socket.on("message", async (eventID, message) => {
            const userFind = await userModel.findOne({_id: userID, delete: false, block: false});
            socket.broadcast
                .to(socketIDsObject[eventID])
                .emit("newMessage", `${userFind.name}: ${message}`);
            console.log(eventID)
            console.log(socketIDsObject)
            const eventFind = await Event.findOne({_id: eventID});
            if (!eventFind) {
                console.log("Don't find this event!")
                return
            }
            if (!eventFind.users.includes(userID)) {
                console.log("Don't find this user on this event!")
                return
            }

           let chatFind = await Chat.findOne({event: eventID})
                .catch(err => {
                    console.log(err);
                });
            if (chatFind === null) {
                let chat = new Chat({
                    event: eventID,
                    message: [{
                        messages: message,
                        userId: userID,
                        data: new Date().toLocaleString()
                    }]
                });
                chat.save();

                let eventUpdate = await Event.updateOne({_id: eventID}, {$set: {chat: chat._id}})
            } else {
                try {
                    let chatUpdate = await Chat.updateOne({event: eventID}, {
                        $push: {
                            message: {
                                messages: message,
                                userId: userID,
                                data: new Date().toLocaleString()
                            }
                        }
                    });
                    let chatFind = await Chat.findOne({event: eventID})
                    let eventUpdate = await Event.updateOne({_id: eventID}, {$set: {chat: chatFind._id}})
                } catch (e) {
                    console.log(e);
                }
           };
        })

        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    });

    return io;
};