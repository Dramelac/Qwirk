import {Main} from "./imports/server-main/main";

import {loadMessages} from "./imports/fixtures/messages";

import "./imports/publications";

Meteor.startup(() => {
    const mainInstance = new Main();
    mainInstance.start();

    loadMessages();
});
