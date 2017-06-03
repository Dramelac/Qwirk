import {MongoObservable} from "meteor-rxjs";
import {Message} from "../models/message.model";
import {Chats} from "./chat.collection";
import * as _ from "underscore";

export const Messages = new MongoObservable.Collection<Message>("messages");

Messages.allow({
    update: function (userId, doc, fields, modifier) {
        if (fields.length === 1 && _.contains(fields, "readBy")) {
            let schema = {$push: {readBy: Meteor.userId()}};
            if (modifier.toString() == schema){
                let chat = Chats.findOne({_id: doc.chatId});
                return _.contains(chat.user, userId);
            }
            return false;
        }
        return doc.ownerId === userId && fields.length == 1 && _.contains(fields, "content");
    },
    remove: function (userId, doc) {
        return doc.ownerId === userId;
    },
});