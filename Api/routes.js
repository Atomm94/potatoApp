const express = require('express');
const router = express.Router();
const userRoutes = require('./User/route').user;
const eventRoutes = require('./Event/route').event;

router.use('/user', userRoutes)
router.use('/event', eventRoutes)

module.exports = {
    router
};