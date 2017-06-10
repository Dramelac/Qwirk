import {MongoObservable} from "meteor-rxjs";
import {Chat, ChatType} from "../models/chat.model";
import * as _ from "underscore";

export const Chats = new MongoObservable.Collection<Chat>("chats");

function checkUser(modifier): boolean {
    if (modifier.$push) {
        if (modifier.$push.user.$each) {
            let schema = {$push: {user: {$each: modifier.$push.user.$each}}};
            if (modifier == schema.toString()) {
                return true;
            }
        } else {
            let schema = {$push: {user: modifier.$push.user}};
            if (modifier.toString() == schema.toString()) {
                return true;
            }
        }
    }
    return false;
}

function checkLeave(fields, modifier): boolean {
    if (fields.length === 1 && _.contains(fields, "user")) {
        let schema = {$pull: {user: Meteor.userId()}};
        let adminSchema = {$pull: {user: Meteor.userId(), admin: Meteor.userId()}};
        if (modifier.toString() == schema || modifier.toString() == adminSchema) {
            return true;
        }
    }
    return false;
}

function checkAdmin(userId, doc, fields, modifier): boolean {
    if (_.contains(doc.admin, userId)) {
        if (fields.length === 1 && _.contains(fields, "user")) {
            return checkUser(modifier);
        }
        if (fields.length === 1 && _.contains(fields, "title")) {
            return true;
        }
        if (fields.length === 1 && _.contains(fields, "publicly")) {
            return true;
        }
        if (fields.length === 1 && _.contains(fields, "picture")) {
            return true;
        }
    }
    return false;
}

Chats.allow({
    //On vérifie que coté client on ne peut inserer que des groupes
    insert: function (userId, doc) {

        return doc.type === ChatType.GROUP && doc.user.length >= 2 &&
            doc.title !== "" && doc.title !== null
    },
    update: function (userId, doc, fields, modifier) {
        if (doc.publicly) {
            if (fields.length === 1 && _.contains(fields, "user")) {
                return checkUser(modifier);
            }
        }
        if (checkLeave(fields, modifier)) return true;

        return checkAdmin(userId, doc, fields, modifier);
    },
    remove: function (userId, doc) {
        return userId === doc.ownerId;
    }
});