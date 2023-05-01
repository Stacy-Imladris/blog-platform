import {emailAdapter} from '../adapters/email-adapter';

export const emailManager = {
    async sendEmailConfirmationMessage(email: string, code: string) {
        const linkWithCode = `https://some-website/auth/registration-confirmation?code=${code}`

        await emailAdapter.sendEmail(email, 'Email confirmation', `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
 <a href=${linkWithCode}>complete registration</a>
 </p>`)
    }
}
