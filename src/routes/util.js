exports.randomString = function(len) {
    var buf = [],
        chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.sendMail = async ({ to, from, subject, text, html }) => {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    const key = process.env.SENDGRID_API_KEY;
    if(!key){
        // SendGrid API Key가 없으면 전자우편을 전송하지 않습니다.
        return false;
    }
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        // const msg = {
        //     to: 'test@example.com',
        //     from: 'test@example.com',
        //     subject: 'Sending with Twilio SendGrid is Fun',
        //     text: 'and easy to do anywhere, even with Node.js',
        //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        // };
        const msg = { to, from, subject, text, html };

        await sgMail.send(msg);

        return true;
    } catch (e) {
        console.error(e);

        return false;
    }
};
