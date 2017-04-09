import {Profiles} from "../../../both/collections/profile.collection";
import {Profile} from "../../../both/models/profile.model";

Meteor.publish('profiles', function(
    userId: string,
    profileBatchCounter: number): Mongo.Cursor<Profile> {
    if (!this.userId || !userId) {
        return;
    }

    return Profiles.collection.find({
        userId: userId
    }, {
        sort: { createdAt: -1 },
        limit: 30 * profileBatchCounter
    });
});
