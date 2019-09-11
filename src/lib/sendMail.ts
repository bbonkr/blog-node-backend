import sendgrid from '@sendgrid/mail';
import { MailData } from '@sendgrid/helpers/classes/mail';

export const sendMail = async (message: MailData): Promise<boolean> => {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    const key = process.env.SENDGRID_API_KEY;
    if (!key) {
        // SendGrid API Key가 없으면 전자우편을 전송하지 않습니다.
        console.warn(
            'SendGrid API Key could not resolve. Check environment variables. [SENDGRID_API_KEY]',
        );
        return false;
    }

    sendgrid.setApiKey(key);

    try {
        // const msg = {
        //     to: 'test@example.com',
        //     from: 'test@example.com',
        //     subject: 'Sending with Twilio SendGrid is Fun',
        //     text: 'and easy to do anywhere, even with Node.js',
        //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        // };

        const [response, etc] = await sendgrid.send(message);

        console.debug(
            '[SendGrid] send ===> ',
            response.statusCode,
            response.body,
        );

        return true;
    } catch (e) {
        console.error(e);

        return false;
    }
};
