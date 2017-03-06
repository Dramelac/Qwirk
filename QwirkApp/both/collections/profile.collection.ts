import { MongoObservable } from "meteor-rxjs";

import {Profile} from "../models/profile.model";

export const Profiles = new MongoObservable.Collection<Profile>("profiles");

Profiles.allow({
    insert: function (userId, doc) {
        return !userId && doc.userId === "";
    },
    update: function (userId, doc, fields, modifier) {
        return doc.userId === "" || doc.userId === userId;
    },
    remove: function (userId, doc) {
        return doc.userId === "" || doc.userId === userId;
    },
});

Profiles.deny({
    update: function (userId, doc, fields, modifier) {
        return !!fields['owner'];
    }
});
