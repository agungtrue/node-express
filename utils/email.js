const nodeMailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// const { htmlToText } = require('html-to-text');
// import { htmlToText } from 'html-to-text'


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0]
        this.url = url;
        this.from = 'Syuhada Dwi Agung <hello@agungtrue.com>'
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            // sendGrid
            return nodeMailer.createTransport({
              service: 'SendGrid',
              auth: {
                  user: process.env.SENDGRID_USERNAME,
                  pass: process.env.SENDGRID_PASSWORD
              }
          });
        }
        
        return nodeMailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            // service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        //send actual email
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        })

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.fromString(html)
        }

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        //send actual email
        await this.send('welcome', 'Welcome to the jungle')
    }

    async sendPasswordReset() {
        //send actual email
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes')
    }
}





const sendEmail = async options => {

    // const transporter = nodeMailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     // service: 'Gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASSWORD
    //     }
    // });

    // const mailOptions = {
    //     from: 'Syuhada Dwi Agung <hello@agungtrue.com>',
    //     to: options.email,
    //     subject: options.subject,
    //     text: options.message,
    //     html: "<b>Forgot Password!!</b>"
    // }

    // await transporter.sendMail(mailOptions);
};

// module.exports = {
//     sendEmail
// };