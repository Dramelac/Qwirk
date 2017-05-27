import {Chats, Messages} from "../../../both/collections";
import {Chat, ChatType, Message} from "../../../both/models";
import Cursor = Mongo.Cursor;

Meteor.publishComposite('chats', function(type?: ChatType): PublishCompositeConfig<Chat> {
    if (!this.userId) {
        return;
    }
    if(!type){
        type = ChatType.CHAT;
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
