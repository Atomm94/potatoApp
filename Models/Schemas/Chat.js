const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event'
    },
    messages: [{
        message: String,
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        data: Date
    }]
});

mongoose.model("chat", chatSchema);

