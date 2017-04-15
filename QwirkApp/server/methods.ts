import {Chats} from "../both/collections/chat.collection";
import {Messages} from "../both/collections/message.collection";
import {MessageType} from "../both/models/message.model";

const nonEmptyString = Match.Where((str) => {
    check(str, String);
    return str.length > 0;
});

Meteor.methods({
    addChat(receiverId: string): void {
        if (!this.userId) {
            throw new Meteor.Error('unauthorized',
                'User must be logged-in to create a new chat');
        }

        check(receiverId, nonEmptyString);

        if (receiverId === this.userId) {
            throw new Meteor.Error('illegal-receiver',
                'Receiver must be different than the current logged in user');
        }

        const chatExists = !!Chats.collection.find({
            user: { $all: [this.userId, receiverId] }
        }).count();

        if (chatExists) {
            throw new Meteor.Error('chat-exists',
                'Chat already exists');
        }

        const chat = {
            user: [this.userId, receiverId],
            admin: [],
            publicly: false
        };

        Chats.insert(chat);
    },

    removeChat(chatId: string): void {
        if (!this.userId) {
            throw new Meteor.Error('unauthorized',
                'User must be logged-in to remove chat');
        }

        check(chatId, nonEmptyString);

        const chatExists = !!Chats.collection.find(chatId).count();

        if (!chatExists) {
            throw new Meteor.Error('chat-not-exists',
                'Chat doesn\'t exist');
        }

        Chats.remove(chatId);
    },

    updateEmail(mail: string, oldMail: string): void {
        if (!this.userId) throw new Meteor.Error('unauthorized',
            'User must be logged-in to create a new chat');

        check(mail, nonEmptyString);
        check(oldMail, nonEmptyString);

        Accounts.addEmail(Meteor.userId(), mail);
        Accounts.removeEmail(Meteor.userId(), oldMail);
        Accounts.sendVerificationEmail(Meteor.userId());
    },

    addMessage(type: MessageType, chatId: string, content: string) {
        if (!this.userId) throw new Meteor.Error('unauthorized',
            'User must be logged-in to create a new chat');

        check(type, Match.OneOf(String, [ MessageType.TEXT ]));
        check(chatId, nonEmptyString);
        check(content, nonEmptyString);

        const chatExists = !!Chats.collection.find(chatId).count();

        if (!chatExists) {
            throw new Meteor.Error('chat-not-exists',
                'Chat doesn\'t exist');
        }

        return {
            messageId: Messages.collection.insert({
                chatId: chatId,
                ownerId: this.userId,
                content: content,
                createdAt: new Date(),
                type: type
            })
        };
    },
    countMessages(): number {
        return Messages.collection.find().count();
    }
});