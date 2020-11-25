const mongoose = require('mongoose');

const config = {
    database: 'mongodb+srv://At11:atmak11@cluster0.d1re6.mongodb.net/potatoApp?retryWrites=true&w=majority',
    tokenAuthKey: 'potatoSecret1515',
    port: 8000
}

mongoose.connect(config.database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const nexmoApis = {
    apiKey: '4607b5c3',
    apiSecret: 'sl0nRG8jtZisr29Q'
}

module.exports = {
    config,
    nexmoApis
};