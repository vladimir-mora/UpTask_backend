import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
dotenv.config();

const config = () => {
  return MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  });
};

export const transporter = nodemailer.createTransport(config());
