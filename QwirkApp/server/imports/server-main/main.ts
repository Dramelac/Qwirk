export class Main {
    start(): void {
        this.mailTemplates();

    }

    mailTemplates(): void {
        Accounts.emailTemplates.siteName = "Qwirk";
        Accounts.emailTemplates.from     = "Qwirk <noreply@qwirk.eu>";

        Accounts.emailTemplates.resetPassword = {
            subject() {
                return "[Qwirk] Reset your password";
            },
            text( user, url ) {
                let urlWithoutHash = url.replace( '#/', '' ),
                    supportEmail   = "support@qwirk.eu",
                    emailBody      = `Hello ,\n\nTo reset your password, follow the link below.\n\n${urlWithoutHash}\n\nIf you are not initiator of this action, you can contact us at this address: ${supportEmail}\n\nBest regards,\nQwirk Team`;

                return emailBody;
            }

        };

        Accounts.emailTemplates.verifyEmail = {
            subject() {
                return "[Qwirk] Verify your email address";
            },
            text( user, url ) {
                let emailAddress   = user.emails[0].address,
                    urlWithoutHash = url.replace( '#/', '' ),
                    supportEmail   = "support@qwirk.eu",
                    emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.\n\nBest regards,\nQwirk Team`;

                return emailBody;
            }
        };
    }
}
