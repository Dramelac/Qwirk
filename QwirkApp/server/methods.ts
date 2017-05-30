import {Chat, ChatType, Contact, MessageType, Profile, Status} from "../both/models";
import {Chats, Contacts, FriendsRequest, Messages, Profiles} from "../both/collections";
import * as _ from "underscore";

const nonEmptyString = Match.Where((str) => {
    if (str != null) {
        check(str, String);
        return str.length > 0;
    }
    return false;
});

Meteor.methods({
    addProfile(firstname: string, lastname: string, birthday: Date, username: string): void{
        if (!Meteor.userId()) {
            throw new Meteor.Error('unauthorized',
                'User must be logged-in to create a new profile');
        }
        if (Profiles.findOne({userId: Meteor.userId()})) {
            throw new Meteor.Error('unauthorized',
                'User already have a profile');
        }
        let profil: Profile = {
            userId: Meteor.userId(),
            status: Status.Online,
            firstname: firstname,
            lastname: lastname,
            birthday: birthday,
            username: username,
            picture: ""
        };
        let profileId = Profiles.collection.insert(profil);
        Meteor.users.update(Meteor.userId(), {$set: {"profile.id": profileId}});
    },

    addChat(receiverId: string): void {
        if (!Meteor.userId()) {
            throw new Meteor.Error('unauthorized',
                'User must be logged-in to create a new chat');
        }

        check(receiverId, nonEmptyString);

        if (receiverId === Meteor.userId()) {
            throw new Meteor.Error('illegal-receiver',
                'Receiver must be different than the current logged in user');
        }

        const chatExists = !!Chats.collection.find({
            user: {$all: [Meteor.userId(), receiverId]}
        }).count();

        if (chatExists) {
            throw new Meteor.Error('chat-exists',
                'Chat already exists');
        }

        const chat:Chat = {
            user: [Meteor.userId(), receiverId],
            admin: [],
            publicly: false,
            type: ChatType.CHAT
        };

        Chats.insert(chat);
    },

    removeChat(chatId: string): void {
        if (!Meteor.userId()) {
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
        if (!Meteor.userId()) throw new Meteor.Error('unauthorized',
            'User must be logged-in to create a new chat');

        check(mail, nonEmptyString);
        check(oldMail, nonEmptyString);

        Accounts.addEmail(Meteor.userId(), mail);
        Accounts.removeEmail(Meteor.userId(), oldMail);
        Accounts.sendVerificationEmail(Meteor.userId());
    },

    addMessage(type: MessageType, chatId: string, content: string) {
        if (!Meteor.userId()) throw new Meteor.Error('unauthorized',
            'User must be logged-in to create a new chat');

        //TODO check non announce message
        check(type, Match.OneOf(String, [MessageType.TEXT]));
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
                ownerId: Meteor.userId(),
                content: content,
                createdAt: new Date(),
                type: type
            })
        };
    },

    countMessages(chatId): number {
        return Messages.collection.find({chatId: chatId}).count();
    },

    searchUser(username: string, friendList: string[]){
        check(Meteor.userId(), nonEmptyString);
        check(username, nonEmptyString);
        friendList.push(Meteor.userId());
        let result = Profiles.find({$and: [{username: {$regex: ".*" + username + ".*"}}, {_id: {$nin: friendList}}, {userId: {$ne: Meteor.userId()}}]});
        return result.fetch();
    },

    addFriendRequest(friendId: string){
        if (!Meteor.userId()) throw new Meteor.Error('unauthorized', 'User must be logged-in to send firendRequest');
        check(friendId, nonEmptyString);

        const requestExist = !!FriendsRequest.collection.find({
            $and: [
                {initiator: Meteor.userId()},
                {destinator: friendId}
            ]
        }).count();

        if (requestExist) {
            throw new Meteor.Error('friend-request-exist', 'Friend Request already exist');
        }
        return {
            friendRequestId: FriendsRequest.collection.insert({
                initiator: Meteor.userId(),
                destinator: friendId,
                message: 'Friend Request a send'
            })
        };
    },

    requestExist(friendId: string){

        if (!Meteor.userId()) throw new Meteor.Error('unauthorized', 'User must be logged-in to send firendRequest');
        check(friendId, nonEmptyString);
        const requestExist = !!FriendsRequest.collection.find({
            $and: [
                {initiator: Meteor.userId()},
                {destinator: friendId}
            ]
        }).count();
        return requestExist;


    },

    removeFriendRequest(initiator: string){
        if (!Meteor.userId()) throw new Meteor.Error('unauthorized', 'User must be logged-in to remove firendRequest');
        check(initiator, nonEmptyString);

        FriendsRequest.remove({
            $and: [
                {initiator: initiator},
                {destinator: Meteor.userId()}
            ]
        })
    },

    newContact(initiator: string): void{
        //On crée un chat pour les nouveux friendList
        const chat:Chat = {
            user: [Meteor.userId(), initiator],
            admin: [],
            publicly: false,
            type: ChatType.CHAT
        };

        let chatId = Chats.collection.insert(chat);
        //On crée pour chacun un contact
        const contactUser: Contact = {
            ownerId: Meteor.userId(),
            friendId: initiator,
            chatId: chatId,
            profileId: Profiles.findOne({userId: initiator})._id,
            displayName: Meteor.users.findOne({_id: initiator}).username,
            isBloqued: false
        };
        const contactInitiator: Contact = {
            ownerId: initiator,
            friendId: Meteor.userId(),
            chatId: chatId,
            profileId: Profiles.findOne({userId: Meteor.userId()})._id,
            displayName: Meteor.user().username,
            isBloqued: false
        };
        Contacts.collection.insert(contactUser);
        Contacts.collection.insert(contactInitiator);
        Meteor.call("removeFriendRequest", initiator);
    },

    removeContact(friendId: string){
        //On recupère le contact rattaché a user actuel
        var contacts = Contacts.collection.findOne({$and: [{ownerId: Meteor.userId()}, {friendId: friendId}]});
        //On fait pareil mais pour l'ami à supprimé
        var contactUser = Contacts.collection.findOne({$and: [{ownerId: friendId}, {friendId: Meteor.userId()}]});

        Meteor.call("removeChat", contacts.chatId);
        Contacts.remove({chatId: contacts.chatId});
    },

    findContact(friendId: string): string{
        if (!Meteor.userId()) throw new Meteor.Error('unauthorized', 'User must be logged-in to search in contact');
        if (friendId) {
            return Contacts.collection.findOne({$and: [{ownerId: Meteor.userId()}, {friendId: friendId}]}).chatId;
        }
    },

    groupCommand(command: string, groupId: string, targetUserId: string, reason?: string, time?: number){
        //must be logged in
        if (!this.userId) {
            return;
        }
        //load chat
        let chat = Chats.findOne({chatId: groupId, admin: this.userId, type: ChatType.GROUP});

        //check existing chat | can't self target
        if (!chat || this.userId === targetUserId) {
            return;
        }
        //check user admin
        if (!_.contains(chat.admin, this.userId)) {
            return;
        }
        //can't target group owner
        if (targetUserId === chat.ownerId) {
            return;
        }

        let isBan: boolean = _.contains(chat.ban, targetUserId);
        let isUser: boolean = _.contains(chat.user, targetUserId);
        let isAdmin: boolean = _.contains(chat.admin, targetUserId);
        if (!isBan && !isUser) {
            //target user is not member of the group
            return;
        }

        let message: string;
        let user = Profiles.findOne({userId: targetUserId});
        //check existing user
        if (!user) {
            return;
        }
        //process command
        switch (command) {
            case "kick":
                if (!time || !isUser) return;
                Chats.update(chat._id, {
                    $pull: {
                        user: targetUserId,
                        admin: targetUserId
                    }
                });
                setTimeout(() => {
                    Chats.update(chat._id, {
                        $push: {
                            user: targetUserId
                        }
                    });
                }, time * 1000);
                message = user.username + " was ejected from the group for " + time + " seconds for the reason : '" + reason + "'";
                //TODO add reason message
                break;
            case "ban":
                //TODO add reason message
                if (isBan) return;
                Chats.update(chat._id, {
                    $pull: {
                        user: targetUserId,
                        admin: targetUserId
                    },
                    $push: {
                        ban: targetUserId
                    }
                });
                message = user.username + " was ban from the group for the reason : '" + reason + "'";
                break;
            case "unban":
                if (!isBan) return;
                Chats.update(chat._id, {$pull: {ban: targetUserId}});
                message = user.username + " is now unban from the group";
                break;
            case "promote":
                if (isBan || isAdmin) return;
                Chats.update(chat._id, {$push: {admin: targetUserId}});
                message = user.username + " is now admin of the group";
                break;
            case "demote":
                if (!isAdmin) return;
                Chats.update(chat._id, {$pull: {admin: targetUserId}});
                message = user.username + " is no longer admin of the group";
                break;
            default:
                return;
        }
        Messages.insert({
            chatId: groupId,
            ownerId: Meteor.userId(),
            content: message,
            createdAt: new Date(),
            type: MessageType.ANNOUNCE
        });
    },

    addGroup(usersId: string[], adminList: string[], groupeTitle:string): void {
        if (!Meteor.userId()) {
            throw new Meteor.Error('unauthorized',
                'User must be logged-in to create a new chat');
        }

        const chat:Chat = {
            user: usersId,
            admin: adminList,
            publicly: false,
            type: ChatType.GROUP,
            title: groupeTitle
        };
        Chats.insert(chat);
    }
});