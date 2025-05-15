import { SENDGRID_API_KEY } from "astro:env/server";
import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "apikey",
        pass: SENDGRID_API_KEY,
    },
});