const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Show debug output
    logger: true // Log information about the mail request
  };
  
  // Add host and port if provided
  if (process.env.EMAIL_HOST) {
    config.host = process.env.EMAIL_HOST;
    config.port = process.env.EMAIL_PORT || 587;
    config.secure = process.env.EMAIL_SECURE === 'true';
  }
  
  logger.info('Creating email transporter with config:', { 
    service: config.service,
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: process.env.EMAIL_USERNAME
  });
  
  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify connection
(async () => {
  try {
    await transporter.verify();
    logger.info('Connected to email server');
    logger.info(`Using email service: ${process.env.EMAIL_SERVICE}`);
  } catch (error) {
    logger.error('Error connecting to email server:', error);
    logger.error('Please check your email configuration in .env file');
  }
})();

// Send email function
exports.sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Message sent: ${info.messageId}`);
    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click this link to reset your password: ${resetUrl}`;
  const html = `
    <div>
      <h2>Password Reset</h2>
      <p>You requested a password reset for your Verdakra account.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return this.sendEmail(email, subject, text, html);
};
