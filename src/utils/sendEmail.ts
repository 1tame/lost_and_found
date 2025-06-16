import nodemailer from 'nodemailer';

export const sendResetEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail
      pass: process.env.EMAIL_PASS, // your App password
    },
  });

  await transporter.sendMail({
    from: '"Lost & Found" <noreply@lostfound.com>',
    to,
    subject: 'Password Reset',
    html: `<p>You requested to reset your password.</p>
           <p><a href="${resetLink}">Click here to reset</a></p>`,
  });
};
