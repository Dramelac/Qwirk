import {Main} from "./imports/server-main/main";

import {loadMessages} from './imports/fixtures/messages';

import './imports/publications/messages';

Meteor.startup(() => {
    const mainInstance = new Main();
    mainInstance.start();

    loadMessages();

    Accounts.emailTemplates.resetPassword.text = function (user, url) {
        url = url.replace('#/', '');
        return "Hello ,\n\nTo reset your password, simply click the link below.\n\n" + url +
            "\n\nThanks.";
    };


});
