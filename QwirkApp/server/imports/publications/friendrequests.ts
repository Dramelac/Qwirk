import {FriendsRequest} from "../../../both/collections/friend-request.collection";
import {FriendRequest} from "../../../both/models/friend-request.model";
Meteor.publish('friendRequest', function (): Mongo.Cursor<FriendRequest> {
    if (!this.userId) {
        return;
    }

    return FriendsRequest.collection.find({
        destinator: this.userId
    });
});