import {CallRequests} from "../../../both/collections";
import {CallRequest} from "../../../both/models/call-request.model";

Meteor.publish('callrequest', function(): Mongo.Cursor<CallRequest> {
    if (!this.userId) {
        return;
    }

    return CallRequests.collection.find({
        targetUserId: this.userId
    });
});