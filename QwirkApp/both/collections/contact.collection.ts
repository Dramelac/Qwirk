import {MongoObservable} from "meteor-rxjs";
//noinspection TypeScriptCheckImport
import {Contact} from "../models/contact.model";

export const Contacts = new MongoObservable.Collection<Contact>("contacts");

Contacts.allow({
    update: function (userId, doc, fields, modifier) {
        return doc.ownerId === userId;
    },
    remove: function (userId, doc) {
        return doc.ownerId === userId;
    },
});