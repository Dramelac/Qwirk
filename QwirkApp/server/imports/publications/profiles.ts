import {Profiles} from "../../../both/collections/profile.collection";
import {Profile} from "../../../both/models/profile.model";
import {Contacts} from "../../../both/collections/contact.collection";
import {Contact} from "../../../both/models/contact.model";

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

Meteor.publish('profile', function(): Mongo.Cursor<Profile> {
    if (!this.userId) {
        return;
    }

    return Profiles.collection.find({
        userId: this.userId
    });
});

Meteor.publish('profileContact', function() : Mongo.Cursor<Profile>{
    if (!this.userId){
        return ;
    }
    let contacts = Profiles.collection.findOne({
        userId : this.userId
    }).contacts;
    let list : string[];
    let contactsResult : Contact[];
    contactsResult = Contacts.collection.find({_id : {$in : [contacts]}}).fetch();

    return null;
});