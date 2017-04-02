import {Profiles} from '../../../both/collections/profile.collection';

Meteor.publish('profiles', function (userId: string) {
    return Profiles.find(buildQuery.call(this, userId));
});

function buildQuery(userId: string): Object {
    return {
        $and: [{
            userId:{$ne: this.userId}
        }]
    };
}