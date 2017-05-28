import {MongoObservable} from "meteor-rxjs";
import {CallRequest} from "../models/call-request.model";
import * as _ from "underscore";

export const CallRequests = new MongoObservable.Collection<CallRequest>("callrequests");

CallRequests.allow({
    insert: function (userId, doc) {
        //TODO check contact list doc.targetUserId
        return doc.ownerUserId === userId;
    },
    update: function (userId, doc) {
        //TODO check field update
        return _.contains(doc.targetUsersId, userId) || _.contains(doc.onlineUsers, userId) || doc.ownerUserId === userId;
    },
    remove: function (userId, doc) {
        return doc.ownerUserId === userId;
    },
});

