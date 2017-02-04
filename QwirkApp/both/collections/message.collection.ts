import { MongoObservable } from "meteor-rxjs";

import {Message} from "../models/message.model";

export const Messages = new MongoObservable.Collection<Message>("messages");

function loggedIn(){
    return !!Meteor.user();
}

Messages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});