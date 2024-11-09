import dotenv from "dotenv";
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";

dotenv.config();

const config = () => {
  return sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY!,
    },
  });
};

export const transporter = nodemailer.createTransport(config());
