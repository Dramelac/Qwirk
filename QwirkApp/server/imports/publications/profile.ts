import {Profiles} from "../../../both/collections/profile.collection";

Meteor.publish('profile', function (userId: string) {
    return Profiles.find(buildQuery.call(this, userId));
});

function buildQuery(userId: string): Object {
    return {
        $and: [{
            userId: this.userId
        }, {
            userId: {
                $exists: true
            }
        }]
    };

}
