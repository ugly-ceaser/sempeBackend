const nodemailer = require("nodemailer");

const sendMail = async (email, subject, message) => {
    try {
        // Create transporter with updated configuration
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false // Add this for development
            }
        });

        // Send mail with defined transport object
        const mailOptions = {
            from: `"Sempe Alumni" <${process.env.MAIL_USER}>`,
            to: email,
            subject: subject,
            html: message,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

module.exports = sendMail;
