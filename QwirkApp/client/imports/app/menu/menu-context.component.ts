import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import template from "./menu-context.component.html";
import {Contacts} from "../../../../both/collections/contact.collection";
import {Contact} from "../../../../both/models/contact.model";
import {Router} from "@angular/router";

@Component({
    selector: 'context',
    template
})

export class ContextComponent implements OnInit, OnDestroy {

    @Input("type") type: boolean;
    @Input("isContact") isContact: boolean;

    constructor(private router: Router) {
    }

    ngOnInit(): void {
        console.log(this.isContact);
    }

    ngOnDestroy(): void {
    }

    deleteContact(friendId: string) {
        Meteor.call("removeContact", friendId, (error, result) => {

        });
    }
    showProfile(friendId: string):void{
        this.router.navigate(["/profile/" + friendId]);
    }

    blockContact(contact: Contact, bool : boolean):void{
        if(bool){
            //contact was block
            Contacts.update({_id : contact._id},{$set : {isBloqued : bool}});
        }else {
            //unblock contact
            Contacts.update({_id : contact._id},{$set : {isBloqued : bool}});
        }
    }

}