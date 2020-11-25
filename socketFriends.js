const socketio = require("socket.io");
const userModel = require('./Models/models').user;
const eventModel = require('./Models/models').event;
const chatModel  = require('./Models/models').chat;
const successHandler = require('./Api/responseFunctions').successHandler;
const errorHandler = require('./Api/responseFunctions').errorHandler;
const path = require('path');

exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socketIDsObject[userID]= id
        socket.on('add', async (friendId, msg) => {
            try {
                const my = await userModel.findOne({_id: userID, delete: false, block: false});
                if (my.addFriend.includes(friendId)) {
                    socket
                        .emit("newNotification", `You are already request to add in your friend this user!: ${friendId}`);
                } else if (my.friends.includes(friendId)) {
                    socket
                        .emit("newNotification", `You and this user are already friends!: ${friendId}`);
                } else {
                    const userFind = await userModel.updateOne({_id: userID, delete: false, block: false}, {$push: {addFriend: friendId}});
                    if (userFind.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this user!";
                        console.log(err);
                    }
                    const friendFind = await userModel.updateOne({_id: friendId, delete: false, block: false}, {$push: {acceptFriend: userID}});
                    const createNotification = await userModel.updateOne({_id: friendId, delete: false, block: false}, {
                        $push: {
                            notifications: {
                                userName: my.userName,
                                id: userID
                            }
                        }
                    })
                    if (friendFind.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this friend!";
                        console.log(err)
                    }
                    socket.broadcast
                        .to(socketIDsObject[friendId])
                        .emit("newNotification", `${msg.msg}: ${userID}`);
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on('accept', async (friendId, msg) => {
            try {
                const my = await userModel.findOne({_id: userID, delete: false, block: false});
                if (my.friends.includes(friendId)) {
                    socket
                        .emit("newNotification", `You and this user are already friends!: ${friendId}`);
                } else if (!my.friends.includes(friendId) && !my.acceptFriend.includes(friendId)) {
                    socket
                        .emit("newNotification", `Nothing to accept!`);
                } else {
                    const userUpdate = await userModel.updateOne({_id: userID, acceptFriend: friendId, delete: false, block: false}, {
                        $push: {friends: friendId},
                        $pull: {acceptFriend: friendId}
                    });
                    if (userUpdate.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this user!";
                        console.log(err)
                    }
                    const acceptUpdate = await userModel.updateOne({_id: friendId, addFriend: userID, delete: false, block: false}, {
                        $push: {friends: userID},
                        $pull: {addFriend: userID}
                    })
                    const friendID = await userModel.findOne({_id: friendId, delete: false, block: false});
                    const removeNotification = await userModel.updateOne({_id: userID, delete: false, block: false}, {
                        $pull: {
                            notifications: {
                                userName: friendID.userName,
                                id: friendId
                            }
                        }
                    })
                    if (acceptUpdate.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this user!";
                        console.log(err)
                    }
                    socket.broadcast
                        .to(socketIDsObject[friendId])
                        .emit("newNotification", `${msg.msg}: ${userID}`);
                }
            } catch (err) {
                console.log(err);
            }
        })
        socket.on('ignore', async (friendId, msg) => {
            try {
                const my = await userModel.findOne({_id: userID, delete: false, block: false});
                if (my.friends.includes(friendId)) {
                    socket
                        .emit("newNotification", `You and this user are already friends!: ${friendId}`);
                } else if (!my.friends.includes(friendId) && !my.acceptFriend.includes(friendId)) {
                    socket
                        .emit("newNotification", `Nothing to ignore!`);
                } else if (my.acceptFriend.includes(friendId)) {
                    socket.broadcast
                        .to(socketIDsObject[userID])
                        .emit("newNotification", `Nothing to ignore!`);
                } else {
                    const userUpdate = await userModel.updateOne({_id: userID, acceptFriend: friendId, delete: false, block: false}, {
                        $pull: {acceptFriend: friendId}
                    });
                    if (userUpdate.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this user!";
                        console.log(err);
                    }
                    const acceptUpdate = await userModel.updateOne({_id: friendId, addFriend: userID, delete: false, block: false}, {
                        $pull: {addFriend: userID}
                    })
                    const friendID = await userModel.findOne({_id: friendId, delete: false, block: false});
                    const removeNotification = await userModel.updateOne({_id: userID, delete: false, block: false}, {
                        $pull: {
                            notifications: {
                                userName: friendID.userName,
                                id: friendId
                            }
                        }
                    })
                    if (acceptUpdate.nModified === 0) {
                        let err = {};
                        err.message = "Don't find this user!";
                        console.log(err);
                    }
                    socket.broadcast
                        .to(socketIDsObject[friendId])
                        .emit("newNotification", `${msg.msg}: ${userID}`);
                }
            } catch (err) {
                console.log(err);
            }
        })

        socket.on("message", async (eventID, message) => {
             const userFind = await userModel.findOne({_id: userID, delete: false, block: false});
             if(!userFind) {
                console.log('This user is not find!');
             }
            const eventFind = await eventModel.findOne({_id: eventID});
                if (!eventFind) {
                    console.log("Don't find this event!")
                    return
                }
                if (!eventFind.users.includes(userID)) {
                    console.log("Don't find this user on this event!")
                    return
                }
                eventFind.users.map(item => {
                    socket.broadcast
                        .to(socketIDsObject[item])
                        .emit("newMessage", `${userFind.name}: ${message}`);
                })
               let chatFind = await chatModel.findOne({event: eventID})
                   .catch(err => {
                      console.log(err);
                 });
                if (chatFind === null) {
                    let chat = new chatModel({
                        event: eventID,
                        messages: [{
                            message: message,
                            userId: userID,
                            data: new Date().toLocaleString()
                        }]
                    });
                    chat.save();

                    let eventUpdate = await eventModel.updateOne({_id: eventID}, {$set: {chat: chat._id}})
                } else {
                    try {
                        let chatUpdate = await chatModel.updateOne({event: eventID}, {
                            $push: {
                                messages: {
                                    message: message,
                                    userId: userID,
                                    data: new Date().toLocaleString()
                                }
                            }
                        });
                        let chatFind = await chatModel.findOne({event: eventID})
                        let eventUpdate = await eventModel.updateOne({_id: eventID}, {$set: {chat: chatFind._id}})
                    } catch (e) {
                        console.log(e);
                    }
               }
        })


        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    })
    return io;
}