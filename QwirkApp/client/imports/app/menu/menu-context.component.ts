import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import template from "./menu-context.component.html";
import {Contacts} from "../../../../both/collections/contact.collection";
import {Contact} from "../../../../both/models/contact.model";
import {Router} from "@angular/router";
import {Chats} from "../../../../both/collections/chat.collection";
import {ChatType} from "../../../../both/models/chat.model";

@Component({
    selector: 'context',
    template
})

export class ContextComponent implements OnInit, OnDestroy {

    @Input("type") type: ChatType;
    @Input("isContact") isContact: boolean;

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
            let index = user.indexOf(Meteor.userId());
            if (index > -1) {
                user.splice(index, 1);
                Chats.update({_id: groupId}, {$set: {user: user}});
            }
        }
    }

}