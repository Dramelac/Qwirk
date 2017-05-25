import {Files} from "../../../both/collections/files.collection";

Meteor.publish('files', function(chatId) {
    if (!chatId || !this.userId){
        return null;
    }
    //TODO check chatId from user
    return Files.collection.find({chatId: chatId});
});

Meteor.publish('file', function(fileId) {
    if (!fileId || !this.userId){
        return null;
    }

    return Files.collection.find(fileId);
});