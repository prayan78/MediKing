const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, token) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, CLIENT_URL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CLIENT_URL) {
    throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS, and CLIENT_URL must be configured.');
  }

  const port = Number(SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE.toLowerCase() === 'true' : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const resetUrl = new URL('/reset-password', CLIENT_URL);
  resetUrl.searchParams.set('token', token);

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: email,
    subject: 'Reset your MediKing password',
    text: `We received a request to reset your MediKing password. Use this link within 30 minutes:\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>We received a request to reset your MediKing password.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
  });
};

module.exports = { sendPasswordResetEmail };
