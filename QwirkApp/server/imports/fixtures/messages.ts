import { Messages, Chats } from '../../../both/collections';
import * as Moment from 'moment';
import {MessageType} from "../../../both/models/message.model"

export function loadMessages() {
    /*if (Messages.find().cursor.count() === 0) {
        const msgs: Message[] = [{
            content: 'Hello there !',
            user: 'Droopy',
            publicly: true
        }, {
            content: 'Hey !What\'s up',
            user: 'Dramelac',
            publicly: true
        }, {
            content: 'Nothing and u ?',
            user: 'Droopy',
            publicly: false
        }];

        msgs.forEach((msg: Message) => Messages.insert(msg));
    }*/


    if (Chats.find({}).cursor.count() === 0) {
        let chatId;

        chatId = Chats.collection.insert({
            title: 'Ethan Gonzalez',
            picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
            admin: [],
            user: [],
            publicly: true
        });

        Messages.collection.insert({
            chatId: chatId,
            content: 'You on your way?',
            createdAt: Moment().subtract(1, 'hours').toDate(),
            type: MessageType.TEXT
        });

        chatId = Chats.collection.insert({
            title: 'Bryan Wallace',
            picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
            admin: [],
            user: [],
            publicly: true
        });

        Messages.collection.insert({
            chatId: chatId,
            content: 'Hey, it\'s me',
            createdAt: Moment().subtract(2, 'hours').toDate(),
            type: MessageType.TEXT
        });

        chatId = Chats.collection.insert({
            title: 'Avery Stewart',
            picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
            admin: [],
            user: [],
            publicly: true
        });

        Messages.collection.insert({
            chatId: chatId,
            content: 'I should buy a boat',
            createdAt: Moment().subtract(1, 'days').toDate(),
            type: MessageType.TEXT
        });

        chatId = Chats.collection.insert({
            title: 'Katie Peterson',
            picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
            admin: [],
            user: [],
            publicly: true
        });

        Messages.collection.insert({
            chatId: chatId,
            content: 'Look at my mukluks!',
            createdAt: Moment().subtract(4, 'days').toDate(),
            type: MessageType.TEXT
        });

        chatId = Chats.collection.insert({
            title: 'Ray Edwards',
            picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
            admin: [],
            user: [],
            publicly: true
        });

        Messages.collection.insert({
            chatId: chatId,
            content: 'This is wicked good ice cream.',
            createdAt: Moment().subtract(2, 'weeks').toDate(),
            type: MessageType.TEXT
        });
    }
}
