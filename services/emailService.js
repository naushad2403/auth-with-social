const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // True for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log( process.env.EMAIL_USER, process.env.EMAIL_PASS );

// Send email function
const sendEmail = async (to, subject, text, html) => {
  const info = await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
    html: html
  });

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
