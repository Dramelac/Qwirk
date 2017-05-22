import {Files} from "../../../both/collections/files.collection";

Meteor.publish('files', function(chatId) {
    if (!chatId || !this.userId){
        return null;
    }
    //TODO check chatId from user
    return Files.collection.find({chatId: chatId});
});