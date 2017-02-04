import { Messages } from '../../../both/collections/message.collection';

Meteor.publish('messages', function() {
    return Messages.find(buildQuery.call(this));
});

Meteor.publish('message', function(messageId: string) {
    return Messages.find(buildQuery.call(this, messageId));
});

function buildQuery(messageId?: string): Object {
    const isAvailable = {
        $or: [{
            publicly: true
        },
        {
            $and: [{
                owner: this.userId
            }, {
                owner: {
                    $exists: true
                }
            }]
        }]
    };

    if (messageId) {
        return {
            // only single party
            $and: [{
                _id: messageId
            },
                isAvailable
            ]
        };
    }

    return isAvailable;
}
