const jwt = require('jsonwebtoken');
const config = require('./config').config;
const express = require('express');
const token = express();
const errorHandler = require('./Api/responseFunctions').errorHandler;
const successHandler = require('./Api/responseFunctions').successHandler;
const userModel = require('./Models/models').user;

token.use('/', async (req,res, next) => {
    const jwtAuth = req.authorization || req.headers['authorization'];
    jwt.verify(jwtAuth, config.tokenAuthKey, (err, user) => {
        if (err) {
            return errorHandler(res, err);
        }
        next();
    })
})

token.get('/getData', async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jwt.decode(token);
        const findUser = await userModel.findOne({_id: decodeToken.data.id}, {token: 0, password: 0})
        return successHandler(res, findUser);
    } catch (err) {
        return errorHandler(res, err);
    }
})

const jwtToken = async (data) => {
    const getToken = await jwt.sign({data: data}, config.tokenAuthKey);
    return getToken;
}


const socketAuth = async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, config.tokenAuthKey, function (err, decoded) {
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
}


module.exports = {
    token,
    jwtToken,
    socketAuth
}
