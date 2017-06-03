import {Chats, Messages} from "../../../both/collections";
import {Chat, Message} from "../../../both/models";
import Cursor = Mongo.Cursor;

Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
    if (!this.userId) {
        return;
    }

    return {
        find: () => {
            return Chats.collection.find({ user: this.userId }, {
                fields: {
                    admin: 0,
                    ban: 0
                }
            });
        },

        children: [
            <PublishCompositeConfig1<Chat, Message>> {
                find: (chat) => {
                    return Messages.collection.find({ chatId: chat._id }, {
                        sort: { createdAt: -1 },
                        limit: 1
                    });
                }
            }
        ]
    };
});
