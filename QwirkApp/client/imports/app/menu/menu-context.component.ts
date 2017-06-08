import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import template from "./menu-context.component.html";
import {Contacts} from "../../../../both/collections/contact.collection";
import {Contact} from "../../../../both/models/contact.model";
import {Router} from "@angular/router";
import {Chats} from "../../../../both/collections/chat.collection";
import {ChatType} from "../../../../both/models/chat.model";
import * as _ from "underscore";

@Component({
    selector: 'context',
    template
})

export class ContextComponent implements OnInit, OnDestroy {

    @Input("type") type: ChatType;
    @Input("isContact") isContact: boolean;

    isUpdate: boolean;
    updateMembers: boolean;

    constructor(private router: Router) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    deleteContact(friendId: string) {
        Meteor.call("removeContact", friendId, (error, result) => {

        });
    }

    showProfile(friendId: string): void {
        this.router.navigate(["/profile/" + friendId]);
    }

    blockContact(contact: Contact, bool: boolean): void {
        if (bool) {
            //contact was block
            Contacts.update({_id: contact._id}, {$set: {isBloqued: bool}});
        } else {
            //unblock contact
            Contacts.update({_id: contact._id}, {$set: {isBloqued: bool}});
        }
    }

    leaveGroup(groupId: string, user: string[]) {
        let ownerId = Chats.findOne({_id: groupId}).ownerId;
        if (ownerId == Meteor.userId()) {
            Chats.remove({_id: groupId});
        } else {
            let chat = Chats.findOne({_id:groupId});
            if (chat && _.contains(chat.admin, Meteor.userId())){
                Chats.update({_id: groupId}, {$pull: {user: Meteor.userId(), admin: Meteor.userId()}});
            } else {
                Chats.update({_id: groupId}, {$pull: {user: Meteor.userId()}});
            }
        }
    }

    editGroup(group: string) {
        this.router.navigate(["/addGroup/" + group]);
    }

}