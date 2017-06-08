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
            picture: "",
            biography: ""
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

        const chat: Chat = {
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

        check(type, Match.OneOf(MessageType.TEXT, MessageType.PICTURE, MessageType.FILE, MessageType.WIZZ));
        check(chatId, nonEmptyString);
        check(content, nonEmptyString);

        const chatExists = !!Chats.collection.find(chatId).count();

        if (!chatExists) {
            throw new Meteor.Error('chat-not-exists',
                'Chat doesn\'t exist');
        }

        Messages.collection.insert({
            chatId: chatId,
            ownerId: Meteor.userId(),
            content: content,
            createdAt: new Date(),
            type: type,
            readBy: [Meteor.userId()]
        });
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
            }).count() ||
            !!Contacts.collection.find({$and: [{ownerId: Meteor.userId()}, {friendId: friendId}]}).count();

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
        const chat: Chat = {
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

    groupCommand(command: string, groupId: string, targetUserId: string, reason?: string, time?: number): string{
        //must be logged in
        if (!this.userId) {
            return "You must be log in";
        }
        //load chat
        let chat = Chats.findOne({_id: groupId, admin: this.userId, type: ChatType.GROUP});

        //check existing chat
        if (!chat) {
            return "Group not found.";
        }
        //can't self target
        if (this.userId === targetUserId) {
            return "You can't target yourself.";
        }
        //check user admin
        if (!_.contains(chat.admin, this.userId)) {
            return "You are not admin on this group.";
        }
        //can't target group owner
        if (targetUserId === chat.ownerId) {
            return "You can't do this on group owner.";
        }

        let isBan: boolean = _.contains(chat.ban, targetUserId);
        let isUser: boolean = _.contains(chat.user, targetUserId);
        let isAdmin: boolean = _.contains(chat.admin, targetUserId);
        if (!isBan && !isUser) {
            //target user is not member of the group
            return "This user is not member of this group.";
        }

        let message: string;
        let user = Profiles.findOne({userId: targetUserId});
        //check existing user
        if (!user) {
            return "Can't find target user.";
        }
        //process command
        switch (command) {
            case "kick":
                if (!time || !isUser) return "Incorrect command arguments.";
                Chats.update(chat._id, {
                    $pull: {
                        user: targetUserId,
                        admin: targetUserId
                    }
                });
                Meteor.setTimeout(() => {
                    Chats.update(chat._id, {
                        $push: {
                            user: targetUserId
                        }
                    });
                    Messages.insert({
                        chatId: groupId,
                        ownerId: this.userId,
                        content: user.username + " is now back in the conversation",
                        createdAt: new Date(),
                        type: MessageType.ANNOUNCE,
                        readBy: [this.userId]
                    });
                }, time * 1000);
                if (!reason) reason = ' ';
                message = user.username + " was ejected from the group for " + time + " seconds for the reason : '" + reason + "'";
                //TODO add reason message
                break;
            case "ban":
                //TODO add reason message
                if (isBan) return "This user is already ban.";
                Chats.update(chat._id, {
                    $pull: {
                        user: targetUserId,
                        admin: targetUserId
                    },
                    $push: {
                        ban: targetUserId
                    }
                });
                if (!reason) reason = ' ';
                message = user.username + " was ban from the group for the reason : '" + reason + "'";
                break;
            case "unban":
                if (!isBan) return "This user is not ban.";
                Chats.update(chat._id, {
                    $pull: {
                        ban: targetUserId
                    },
                    $push: {
                        user: targetUserId
                    }
                });
                message = user.username + " is now unban from the group";
                break;
            case "promote":
                if (isBan) return "You can't promote this user.";
                if (isAdmin) return "This user is already admin of this group.";
                Chats.update(chat._id, {$push: {admin: targetUserId}});
                message = user.username + " is now admin of the group";
                break;
            case "demote":
                if (!isAdmin) return "Target user is not admin.";
                Chats.update(chat._id, {$pull: {admin: targetUserId}});
                message = user.username + " is no longer admin of the group";
                break;
            default:
                return "Command not found.";
        }
        Messages.insert({
            chatId: groupId,
            ownerId: Meteor.userId(),
            content: message,
            createdAt: new Date(),
            type: MessageType.ANNOUNCE,
            readBy: [Meteor.userId()]
        });
    }
});