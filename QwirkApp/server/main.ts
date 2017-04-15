import {Main} from "./imports/server-main/main";

import {loadMessages} from "./imports/fixtures/messages";

import "./imports/publications";

Meteor.startup(() => {
    const mainInstance = new Main();
    mainInstance.start();

    loadMessages();

    Accounts.emailTemplates.siteName = "Qwirk";
    Accounts.emailTemplates.from     = "Qwirk <noreply@qwirk.eu>";

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


});
