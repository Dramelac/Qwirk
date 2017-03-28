import {Chats} from "../../../both/collections/chat.collection";

Meteor.publish('chats', function() {
    return Chats.find({});
});

