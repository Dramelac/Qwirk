import {MongoObservable} from "meteor-rxjs";
import {CallRequest} from "../models/call-request.model";

export const CallRequests = new MongoObservable.Collection<CallRequest>("callrequests");

CallRequests.allow({
    insert: function (userId, doc) {
        //TODO check contact list doc.targetUserId
        return doc.ownerUserId === userId;
    },
    remove: function (userId, doc) {
        return doc.targetUserId === userId || doc.ownerUserId === userId;
    },
});

