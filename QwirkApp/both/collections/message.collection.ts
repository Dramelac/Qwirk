import {MongoObservable} from "meteor-rxjs";
import {Message} from "../models/message.model";
import * as _ from "underscore";

export const Messages = new MongoObservable.Collection<Message>("messages");

Messages.allow({
    update: function (userId, doc, fields, modifier) {
        return doc.ownerId === userId && fields.length == 1 && _.contains(fields, "content");
    },
    remove: function (userId, doc) {
        return doc.ownerId === userId;
    },
});