import {Main} from "./imports/server-main/main";

import "./imports/publications";

Meteor.startup(() => {
    const mainInstance = new Main();
    mainInstance.start();

});
