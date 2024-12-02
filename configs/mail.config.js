const nodeMailer = require("nodemailer");
require("dotenv").config();

const transport = nodeMailer.createTransport({
    host: process.env.MAIL_HOST, // 'smtp.gmail.com'
    port: process.env.MAIL_PORT, // '587' for TLS
    auth: {
        user: process.env.MAIL_USER, // 'your-email@gmail.com'
        pass: process.env.MAIL_PASS, // App password or your Gmail password
    },
    secure: false, // false for TLS
    tls: {
        rejectUnauthorized: false, // This allows self-signed certificates (if needed)
    },
});

module.exports = transport;
