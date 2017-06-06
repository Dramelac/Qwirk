import {FriendsRequest} from "../../../both/collections/friend-request.collection";
import {FriendRequest} from "../../../both/models/friend-request.model";
Meteor.publish('friendRequest', function (destinator?:string): Mongo.Cursor<FriendRequest> {
    if (!this.userId) {
        return;
    }
    if(destinator){
        return FriendsRequest.collection.find({
            destinator: this.userId
        });
    }
    return FriendsRequest.collection.find({$or : [
        {initiator : this.userId},
        {destinator: this.userId}
    ]
    });

});