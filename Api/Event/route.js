const express = require('express');
const event = express();
const controllers = require('./index');

event.post('/newEvent', controllers.newEvent)
event.get('/log/getUserEvents', controllers.getUserEvents)
event.get('/getEvent', controllers.getEvent)
event.get('/deleteEvent', controllers.deleteEvent)
event.get('/getMessages', controllers.getMessages)

module.exports = {
    event
}