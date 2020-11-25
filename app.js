const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const config = require('./config').config;
const app = express();
const router = require('./Api/routes').router;
const token = require('./jwtValidation').token;
const port = process.env.PORT || 5000 || config.port;
const socketAuth = require('./jwtValidation').socketAuth;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());
app.use(express.static(path.join(__dirname, 'Media')));

app.use('/api/token', token)
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'Media')));

app.use('/api/token', token);
app.use('/api/user/log', token);
app.use('/api', router);

const server = require('http').createServer(app);
//const ioChat = require("./chat").listen(server);
const io = require("./socketFriends").listen(server);

io.use(socketAuth)

server.listen(port, () => {
    console.log(`Server started on port ${port}`)
})