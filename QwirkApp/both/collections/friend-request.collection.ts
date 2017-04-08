import {FriendRequest} from "../models/friend-request.model";
import {MongoObservable} from "meteor-rxjs";
export const FriendsRequest = new MongoObservable.Collection<FriendRequest>("friendRequest");

function loggedIn(){
    return !!Meteor.user();
}

FriendsRequest.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});