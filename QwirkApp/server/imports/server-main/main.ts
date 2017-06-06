export class Main {
    start(): void {
        this.mailTemplates();

    }

    mailTemplates(): void {
        Accounts.emailTemplates.siteName = "Qwirk";
        Accounts.emailTemplates.from     = "Qwirk <postmaster@noreply.qwirk.eu>";

        Accounts.emailTemplates.resetPassword.text = function (user, url) {
            url = url.replace('#/', '');
            return "Hello ,\n\nTo reset your password, simply click the link below.\n\n" + url +
                "\n\nThanks.";
        };

        Accounts.emailTemplates.verifyEmail = {
            subject() {
                return "[Qwirk] Verify your email address";
            },
            text( user, url ) {
                let emailAddress   = user.emails[0].address,
                    urlWithoutHash = url.replace( '#/', '' ),
                    supportEmail   = "support@qwirk.eu",
                    emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;

                return emailBody;
            }
        };
    }
}
