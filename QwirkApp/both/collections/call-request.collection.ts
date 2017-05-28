import {MongoObservable} from "meteor-rxjs";
import {CallRequest} from "../models/call-request.model";
import * as _ from "underscore";
import {Chats} from "./chat.collection";

export const CallRequests = new MongoObservable.Collection<CallRequest>("callrequests");

CallRequests.allow({
    insert: function (userId, doc) {
        if (doc.rejectUsers.length !== 0 ||
            doc.onlineUsers.length > 1 ||
            doc.onlineUsers[0] !== userId){
            return false;
        }
        let chat = Chats.findOne({_id:doc.chatId,user:userId});
        if (chat){
            doc.targetUsersId.forEach((u)=>{
                if (!_.contains(chat.user,u)) return false;
            });
            return doc.ownerUserId === userId;
        }
        return false;
    },
    update: function (userId, doc) {
        return _.contains(doc.targetUsersId, userId) || _.contains(doc.onlineUsers, userId) || doc.ownerUserId === userId;
    },
    remove: function (userId, doc) {
        return doc.ownerUserId === userId;
    },
});

CallRequests.deny({
    update: function (userId, doc, fields, modifier) {
        return !!fields['ownerUserId'] || !!fields['chatId'] || !!fields['video'];
    }
});
