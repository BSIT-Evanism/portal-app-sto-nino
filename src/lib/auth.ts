import { betterAuth } from "better-auth";
import { BETTER_AUTH_SECRET, SENDGRID_EMAIL } from "astro:env/server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { transporter } from "./email";
import { createAuthMiddleware } from "better-auth/api";

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
        },
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
            },
            rejected: {
                type: 'boolean',
                required: false,
                defaultValue: false,
                input: false
            }
        }
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path.startsWith("/sign-up")) {
                const newSession = ctx.context.newSession;
                if (newSession) {
                    await transporter.sendMail({
                        from: SENDGRID_EMAIL,
                        to: newSession.user.email,
                        subject: 'Welcome to Sto. Niño Barangay Portal',
                        html: `<p>Welcome to Sto. Niño Barangay Portal, ${newSession.user.name}!</p>
                              <p>Your account is currently pending approval from our administrators. We will notify you once your account has been approved.</p>
                              <p>Thank you for your patience.</p>`
                    })
                }
            }

            // if (ctx.path.startsWith('/sign-in')) {
            //     const newSession = ctx.context.newSession;
            //     if (newSession) {
            //         if (newSession.user.role === 'admin') {
            //             ctx.context.returned = {
            //                 redirect: '/admin'
            //             };
            //         } else {
            //             ctx.context.returned = {
            //                 redirect: '/'
            //             };
            //         }
            //     }
            // }
        }),
    },
})