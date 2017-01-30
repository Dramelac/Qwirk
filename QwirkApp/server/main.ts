import { Main } from "./imports/server-main/main";

import { loadMessages } from './imports/fixtures/messages';


Meteor.startup(() => {
    const mainInstance = new Main();
    mainInstance.start();

    loadMessages();
});
