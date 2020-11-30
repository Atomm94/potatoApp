// const io = require("socket.io");
// const User = require('../models/user');
// const UserChat = require('../models/userChat');
// const moment = require('moment');
// const fs = require("fs")
// const  path = require(("path"))
//
// moment().format();
//
// const friends = {
//     init(server) {
//         this.io = io(server);
//         this.startListening()
//     },
//     startListening() {
//         this.io.on("connection", (socket) => {
//
//             // const myID = socket.decoded
//             // console.log("nnn", myID);
//             console.log(`new connection id: ${socket.id}`);
//
//             socket.on("disconnect", async () => {
//                 console.log("Friends disconnect");
//             });
//             socket.on("sendNotification", async (data) => {
//                 console.log(data.userID, 'jjjj');
//                 const me = await User.findOne({_id: data.id}).select("addFriend");
//                 const isSend = me.addFriend.includes(data.userID);
//                 if (isSend) {
//                     console.log('You have been sent a friend request!');
//                     socket.emit('FriendsId', {data: 'You have been sent a friend request!'})
//                 } else {
//                     await User.updateOne({_id: data.userID},
//                         {$push: {friendNotification: data.id}});
//
//                     await User.updateOne({_id: data.id},
//                         {$push: {addFriend: data.userID}}
//                     );
//
//                     // socket.broadcast
//                     // // .to(friendID[friendID])
//                     // // .to('friendsvvv')
//                     //     .emit('A user has joined the friends sendNotification', data);
//                     // socket.emit('FriendsId', {data: 'Hello Client'}, async ()=>{
//                     //
//                     //
//
//
//                     console.log('sendNotification', data);
//                 }
//             });
//
//
//             socket.on('acceptFriends', async (data) => {
//                 let MeacceptFriends = await User.findOne({_id: data.id}).select("friends");
//                 let isSendMeacceptFriends = MeacceptFriends.friends.includes(data.userID);
//                 if (isSendMeacceptFriends) {
//                     console.log('Friend request - already sent!');
//                     socket.emit('FriendsId', {data: 'Friend request - already sent!'})
//                 } else {
//                     await User.updateOne({_id: data.id},
//                         {$push: {friends: data.userID}}
//                     );
//                     await User.updateOne({_id: data.id},
//                         {$pull: {addFriend: data.userID}}
//                     );
//                     await User.updateOne({_id: data.userID},
//                         {$push: {friends: data.id}}
//                     );
//                     await User.updateOne({_id: data.userID},
//                         {$pull: {friendNotification: data.id}}
//                     );
//                     console.log('lll')
//                 }
//             });
//
//             socket.on('IgnoreFriends', async (data) => {
//                 const meIgnoreFriends = await User.findOne({_id: data.id}).select("friends")
//                 const isSendIgnoreFriends = meIgnoreFriends.friends.includes(data.userID);
//                 if (isSendIgnoreFriends) {
//                     console.log('Friend request-not accepted!');
//                     socket.emit('FriendsId', {data: 'Friend request-not accepted!'})
//                 } else {
//                     //id
//                     await User.updateOne({_id: data.id},
//                         {$pull: {addFriend: data.userID}});
//                     //userId
//                     await User.updateOne({_id: data.userID},
//                         {$pull: {friendNotification: data.id}});
//                     console.log('kkkkkk')
//                 }
//
//             });
//
//             ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//             //Chat
//             socket.on('sendMessage', async (data) => {
//                 console.log('message =>', data);
//                 socket.emit('eventClient', {data: 'Hello Client'});
//                 socket.broadcast.emit('message', 'A user has joined the chat');
//                 socket.emit('msgEmit', {data: data});
//                 let chatFind = await UserChat.findOne({$and: [{userId: data.userId}, {clientId: data.clientId}]})
//                     .catch(err => {
//                         console.log(err);
//                     });
//                 if (chatFind === null) {
//                     let chat = new UserChat({
//                         userId: data.userId,
//                         clientId: data.clientId,
//                         message: [{
//                             messages: data.messages,
//                             fromId: data.fromId,
//                             sendId: data.sendId,
//                             data: new Date()
//                             // data: moment().format("MM-DD-YYYY")
//                         }]
//                     });
//                     chat.save()
//                 } else {
//                     // let ChatGetAll= await UserChat.findOne({$and: [{userId: data.userId}, {clientId: data.clientId}]});
//                     // console.log(ChatGetAll,'lll');
//
//                     try {
//                         let chatUpdate = await UserChat.updateOne({$and: [{userId: data.userId}, {clientId: data.clientId}]}, {
//                             $push: {
//                                 message: {
//                                     messages: data.messages,
//                                     fromId: data.fromId,
//                                     sendId: data.sendId,
//                                     data: new Date()
//                                 }
//                             }
//                         });
//                         console.log(chatUpdate, 'chatUpdate');
//
//
//                     } catch (e) {
//                         console.log(e, 'error')
//                     }
//                 }
//
//             });
//             socket.on('getAll', async (data) => {
//                 try {
//                     let ChatGetAll = await UserChat.findOne({$and: [{userId: data.userId}, {clientId: data.clientId}]});
//                     console.log(ChatGetAll, 'ChatGetAll')
//                 } catch (e) {
//                     console.log(e)
//                 }
//             });
//
//
//             socket.on('upload', async (data) => {
//                 console.log(data, 'Upload');
//
//                 socketUpload(data);
//             })
//
//         })
//
//
//     }
//
// };
//
//
// module.exports = friends;
