import {Profiles} from "../../../both/collections/profile.collection";
import {Profile} from "../../../both/models/profile.model";
import {Contacts} from "../../../both/collections/contact.collection";

Meteor.publish('profiles', function (userId: string,
                                     profileBatchCounter: number): Mongo.Cursor<Profile> {
    if (!this.userId || !userId) {
        return;
    }

    return Profiles.collection.find({
        userId: userId
    }, {
        sort: {createdAt: -1},
        limit: 30 * profileBatchCounter
    });
});

Meteor.publish('profile', function (): Mongo.Cursor<Profile> {
    if (!this.userId) {
        return;
    }

    return Profiles.collection.find({
        userId: this.userId
    });
});

Meteor.publish('profileFriend', function (friendList: string[]): Mongo.Cursor<Profile> {
    if (!this.userId) {
        return;
    }
    return Profiles.collection.find({_id: {$in: friendList}});
});

Meteor.publish('profileContact', function (profileId? : string): Mongo.Cursor<Profile> {
    if (!this.userId) {
        return;
    }
    let list: string[] = [];
    let contactsResult = Contacts.collection.find({ownerId : this.userId});
    if (contactsResult) {
        contactsResult.forEach(contact => {
            list.push(contact.profileId)
        });
        if(profileId){
            return Profiles.collection.find({$and : [{_id : {$in: list}},{_id : profileId}]});
        }else{
            return Profiles.collection.find({_id : {$in: list}});
        }
    }
    return null;
});