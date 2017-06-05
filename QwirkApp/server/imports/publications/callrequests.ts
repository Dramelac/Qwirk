import {CallRequests} from "../../../both/collections";
import {CallRequest} from "../../../both/models/call-request.model";

Meteor.publish('callrequest', function(): Mongo.Cursor<CallRequest> {
    if (!this.userId) {
        return;
    }

    return CallRequests.collection.find({
        $or: [
            {targetUsersId: this.userId},
            {"onlineUsers.userId": this.userId},
            {rejectUsers: this.userId}
    ]
    });
});

Meteor.publish('myCallRequest', function(id: string): Mongo.Cursor<CallRequest> {
    if (!this.userId || !id) {
        return;
    }

    return CallRequests.collection.find({
        ownerUserId: this.userId,
        chatId: id
    });
});