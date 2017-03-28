import { Messages } from '../../../both/collections/message.collection';

Meteor.publish('messages', function() {
    return Messages.find(buildQuery.call(this));
});

Meteor.publish('message', function(chatId: string) {
    return Messages.find(buildQuery.call(this, chatId));
});

function buildQuery(chatId?: string): Object {
    /*const isAvailable = {
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
    };*/

    if (chatId) {
        return {chatId: this.chatId};
    }

    return {};
}
