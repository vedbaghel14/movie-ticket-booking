const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({to, subject, body}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: body,
    });
    console.log("Email sent successfully");
    return info;
  } catch (error) {
    console.log("Error sending email", error);
    throw error
  }
}

module.exports = {sendEmail}