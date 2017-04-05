import {Messages} from "../../../both/collections/message.collection";
import {Message} from "../../../both/models/message.model";

Meteor.publish('messages', function(
    chatId: string,
    messagesBatchCounter: number): Mongo.Cursor<Message> {
    if (!this.userId || !chatId) {
        return;
    }

    return Messages.collection.find({
        chatId: chatId
    });
});
