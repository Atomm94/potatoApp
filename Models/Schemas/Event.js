const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'chat'
    },
    when: String,
    where: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    delete: {
        type: Boolean,
        default: false
    }
})

mongoose.model('event', eventSchema)