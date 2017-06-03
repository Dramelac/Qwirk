import {Chats, Files} from "../../../both/collections";
import {Chat} from "../../../both/models";

Meteor.publish('files', function(chatId) {
    if (!chatId || !this.userId){
        return null;
    }
    let chat:Chat = Chats.findOne({_id:chatId,user:this.userId});
    if (chat){
        return Files.collection.find({chatId: chatId});
    }
    return null;
});

Meteor.publish('file', function(fileId) {
    if (!fileId || !this.userId){
        return null;
    }

    return Files.collection.find(fileId);
});