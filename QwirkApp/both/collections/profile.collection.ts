import {MongoObservable} from "meteor-rxjs";

import {Profile} from "../models/profile.model";

export const Profiles = new MongoObservable.Collection<Profile>("profiles");

Profiles.allow({
    update: function (userId, doc, fields, modifier) {
        return doc.userId === userId;
    },
    remove: function (userId, doc) {
        return doc.userId === userId;
    },
});

Profiles.deny({
    update: function (userId, doc, fields, modifier) {
        return !!fields['owner'];
    }
});
