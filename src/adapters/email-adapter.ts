import nodemailer from 'nodemailer';
import {settings} from '../settings';

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: settings.SMTP_LOGIN,
                pass: settings.SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: 'Blog-platform <ada.davis27@gmail.com>',
            to: email,
            subject,
            html: message,
        })
    }
}