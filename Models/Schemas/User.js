const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [{
            lat: Number,
            long: Number
        }],
        required: true
    }
});

const userSchema = new Schema({
    avatar: {
        type: String,
        default: 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-PNG-Icon-715x715.png'
    },
    name: {
        type: String,
        default: null
    },
    userName: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    },
    birthDay: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    delete: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: Schema.Types.ObjectId,
        ref: 'verifyCode'
    },
    block: {
        type: Boolean,
        default: true
    },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'event'
    }],
    addFriend: [{
        type: Schema.Types.ObjectId
    }],
    acceptFriend: [{
        type: Schema.Types.ObjectId
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    quickAdd: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    invite: {
        type: [Object]
    },
    location: {
        type: pointSchema,
    },
    notifications: [{
        userName: String,
        id: String
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

const verifySchema = new Schema ({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    code: {
        type: Number
    },
    createdAt: { type: Date, expires: 420, default: Date.now }
})

verifySchema.index({"lastModifiedDate": 1 },{ expireAfterSeconds: 420 });
mongoose.model('user', userSchema)
mongoose.model('verifyCode', verifySchema)