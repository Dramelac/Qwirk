import {MongoObservable} from "meteor-rxjs";
import {Chat, ChatType} from "../models/chat.model";
import _ = require("underscore");

export const Chats = new MongoObservable.Collection<Chat>("chats");

function loggedIn(){
    return !!Meteor.user();
}

//TODO add security to chat operation
Chats.allow({
    //On vérifie que coté client on ne peut inserer que des groupes
    insert: function (userId, doc) {
        if(doc.type === ChatType.CHAT || doc.user.length < 2 ||
        doc.title === "" || doc.title === null){
            return false;
        } else {
            return true;
        }
    },
    update: function (userId, doc, fields, modifier) {
        if(doc.publicly){
            if(fields.length === 1 && _.contains(fields,"user")){
                let schema = {$push : { user : {$each: modifier.$push.user.$each}}};
                if(modifier == schema.toString){
                    return true;
                }
            }
        }
        if(_.contains(doc.admin, userId)){
            return true;
        }
        return false;
    },
    remove: loggedIn
});