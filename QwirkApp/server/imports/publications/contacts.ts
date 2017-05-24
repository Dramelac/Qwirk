import {Contact} from "../../../both/models/contact.model";
import {Contacts} from "../../../both/collections/contact.collection";

Meteor.publish('myContacts', function(): Mongo.Cursor<Contact> {
    if (!this.userId) {
        return;
    }

    return Contacts.collection.find({
        ownerId: this.userId
    });
});

Meteor.publish('contact', function (profileId : string): Mongo.Cursor<Contact> {
    if (!this.userId) {
        return;
    }
    return Contacts.collection.find({
        profileId : profileId
    });

});