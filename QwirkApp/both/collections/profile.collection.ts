import { MongoObservable } from "meteor-rxjs";

import {Profile} from "../models/profile.model";

export const Profiles = new MongoObservable.Collection<Profile>("profiles");

function loggedIn(){
    return !!Meteor.user();
}


Profiles.allow({
    insert: function (userId, doc) {
        return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fields, modifier) {
        return doc.userId === userId;
    },
    remove: function (userId, doc) {
        return doc.userId === userId;
    },
});

Profiles.deny({
    update: function (userId, doc, fields, modifier) {
        return modifier.contains(fields, 'owner');
    }
});
