import {emailAdapter} from '../adapters/email-adapter';
import {UserModel} from '../models/users/UserModel';

export const emailManager = {
    async sendEmailConfirmationMessage(user: UserModel) {
        const code = user.emailConfirmation.confirmationCode
        const linkWithCode = `https://some-website/auth/registration-confirmation?code=${code}`

        await emailAdapter.sendEmail(user.email, 'Email confirmation', `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
 <a href=${linkWithCode}>complete registration</a>
 </p>`)
    }
}
