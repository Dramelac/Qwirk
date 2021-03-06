import {Profiles} from "../../../both/collections/profile.collection";
import {Profile} from "../../../both/models/profile.model";
import {Contacts} from "../../../both/collections/contact.collection";

let publicProfileFilter = {
    _id: 1,
    userId: 1,
    username: 1,
    picture: 1,
    biography: 1
};

Meteor.publish('profiles', function (userId: string): Mongo.Cursor<Profile> {
    if (!this.userId || !userId) {
        return;
    }

    let contact = Contacts.findOne({ownerId: this.userId, friendId: userId, isBloqued: false});
    if (contact) {

        return Profiles.collection.find({
            userId: userId
        });
    }

    return Profiles.collection.find({
        userId: userId
    }, {
        fields: publicProfileFilter
    });
});

Meteor.publish('profileId', function (id: string): Mongo.Cursor<Profile> {
    if (!this.userId || !id) {
        return;
    }

    let contact = Contacts.findOne({ownerId: this.userId, profileId: id, isBloqued: false});
    if (contact) {

        return Profiles.collection.find({
            _id: id
        });
    }

    return Profiles.collection.find({
        _id: id
    }, {
        fields: publicProfileFilter
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

Meteor.publish('profileContact', function (profileId?: string): Mongo.Cursor<Profile> {
    if (!this.userId) {
        return;
    }
    let list: string[] = [];
    let contactsResult = Contacts.collection.find({ownerId: this.userId});
    if (contactsResult) {
        contactsResult.forEach(contact => {
            list.push(contact.profileId)
        });
        if (profileId) {
            return Profiles.collection.find({$and: [{_id: {$in: list}}, {_id: profileId}]});
        } else {
            return Profiles.collection.find({_id: {$in: list}});
        }
    }
    return null;
});