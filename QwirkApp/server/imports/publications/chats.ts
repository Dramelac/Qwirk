import {Chats, Messages} from "../../../both/collections";
import {Chat, Message} from "../../../both/models";
import _ = require("underscore");
import Cursor = Mongo.Cursor;

Meteor.publishComposite('chats', function (): PublishCompositeConfig<Chat> {
    if (!this.userId) {
        return;
    }

    return {
        find: () => {
            return Chats.collection.find({user: this.userId}, {
                fields: {
                    ban: 0
                }
            });
        },

        children: [
            <PublishCompositeConfig1<Chat, Message>> {
                find: (chat) => {
                    return Messages.collection.find({chatId: chat._id}, {
                        sort: {createdAt: -1},
                        limit: 1
                    });
                }
            }
        ]
    };
});
Meteor.publish('chat', function (chatId: string): Mongo.Cursor<Chat> {
    if (!this.userId) {
        return;
    }
    let chat =  Chats.collection.findOne({_id: chatId});
    if(_.contains(chat.user,Meteor.userId())){
        return Chats.collection.find({
            _id: chatId
        }, {
            fields: {
                _id: 1,
                title: 1,
                publicly: 1,
                user : 1
            }
        });
    } else {
       return null;
    }
});
