const mongoose = require('mongoose');
require('./Schemas/User');
require('./Schemas/Event');
require('./Schemas/Chat');

const user = mongoose.model('user');
const verifyCode = mongoose.model('verifyCode');
const event = mongoose.model('event');
const chat = mongoose.model('chat');

module.exports = {
    user,
    verifyCode,
    event,
    chat
}
