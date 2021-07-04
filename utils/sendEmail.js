const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Create message configuration
  const message = {
    from: `process.env.FROM_NAME <process.env.FROM_MAIL>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send mail with defined transport object
  const info = transporter.sendMail(message);

  console.log('Message sent %s' + info.messageId);
};

module.exports = sendEmail;
