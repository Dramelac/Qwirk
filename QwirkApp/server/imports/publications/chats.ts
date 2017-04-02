import {Chats} from "../../../both/collections/chat.collection";
import {Chat} from "../../../both/models/chat.model";
import Cursor = Mongo.Cursor;

Meteor.publish('chats', function (): Mongo.Cursor<Chat> {
    if (!this.userId) {
        return;
    }

    return Chats.collection.find({
        $or: [{
            user: {$elemMatch: {"$in": [this.userId], "$exists": true}}
        }, {
            admin: {$elemMatch: {"$in": [this.userId], "$exists": true}}
        }]
    })
});
