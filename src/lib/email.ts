import { SENDGRID_API_KEY, SENDGRID_EMAIL } from "astro:env/server";
import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SENDGRID_EMAIL,
        pass: SENDGRID_API_KEY,
    },
});