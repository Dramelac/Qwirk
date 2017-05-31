import {MongoObservable} from "meteor-rxjs";
import {Chat} from "../models/chat.model";

export const Chats = new MongoObservable.Collection<Chat>("chats");

function loggedIn(){
    return !!Meteor.user();
}

Chats.allow({
    insert: loggedIn
});