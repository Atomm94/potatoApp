const smsCode = require('generate-sms-verification-code')
const Nexmo = require('nexmo');
const nexmoApis = require('./config').nexmoApis;


const sendSmsCode = (phone) => {
    const generatedVerificationCode = smsCode(4, {type: 'number'})

    const nexmo = new Nexmo({
        apiKey: nexmoApis.apiKey,
        apiSecret: nexmoApis.apiSecret,
    });

    const from = 'Vonage APIs';
    const to = `${phone}`;
    const text = `Your verification code is ${generatedVerificationCode}`;

    nexmo.message.sendSms(from, to, text);
    return generatedVerificationCode;
}

const sendLink = (phone) => {
    const nexmo = new Nexmo({
        apiKey: nexmoApis.apiKey,
        apiSecret: nexmoApis.apiSecret,
    });

    const from = 'Vonage APIs';
    const to = `${phone}`;
    const text = `Invite on link http://localhost:5000/api/user/invite`;

    nexmo.message.sendSms(from, to, text);
}

module.exports = {
    sendSmsCode,
    sendLink
}