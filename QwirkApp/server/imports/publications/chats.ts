import {Chats} from "../../../both/collections/chat.collection";
import {Chat} from "../../../both/models/chat.model";
import Cursor = Mongo.Cursor;
import {Messages} from "../../../both/collections/message.collection";
import {Message} from "../../../both/models/message.model";

Meteor.publishComposite('chats', function(type?: string): PublishCompositeConfig<Chat> {
    if (!this.userId) {
        return;
    }
    if(!type){
        type = "Chats";
    }

    return {
        find: () => {
            return Chats.collection.find({$and : [{ user: this.userId },{type : type}]});
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
