import {FriendRequest} from "../models/friend-request.model";
import {MongoObservable} from "meteor-rxjs";
export const FriendsRequest = new MongoObservable.Collection<FriendRequest>("friendRequest");
