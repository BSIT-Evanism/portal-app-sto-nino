import { betterAuth } from "better-auth";
import { BETTER_AUTH_SECRET, SENDGRID_EMAIL } from "astro:env/server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { transporter } from "./email";
export const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            const html = `<p>Click <a href="${url}">here</a> to reset your password.</p>`;
            await transporter.sendMail({
                from: SENDGRID_EMAIL,
                to: user.email,
                subject: 'Reset Password',
                html
            });
        }
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false
            },
            approved: {
                type: 'boolean',
                required: false,
                defaultValue: false,
                input: false
            }
        }
    },

})