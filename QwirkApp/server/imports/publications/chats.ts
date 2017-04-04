import {Chats} from "../../../both/collections/chat.collection";
import {Chat} from "../../../both/models/chat.model";
import Cursor = Mongo.Cursor;
import {Messages} from "../../../both/collections/message.collection";
import {Message} from "../../../both/models/message.model";

Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
    if (!this.userId) {
        return;
    }

    return {
        find: () => {
            return Chats.collection.find({ user: this.userId });
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
