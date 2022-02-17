const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
require("dotenv").config();

class CreateSenderSendGrid {
  async send(msg) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return await sgMail.send({ ...msg, from: "alexanderkrp93@gmail.com" });
  }
}

class CreateSenderNodemailer {
  async send(msg) {
    const config = {
      host: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({ ...msg, from: "goitnodejs@meta.ua" });
  }
}

module.exports = { CreateSenderSendGrid, CreateSenderNodemailer };
