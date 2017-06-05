import {Component, OnInit} from "@angular/core";

import template from "./side-menu.component.html";
import style from "./side-menu.component.scss";
import {ChatType} from "../../../../both/models/chat.model";
import {Status} from "../../../../both/models/status.enum";
import {Profiles} from "../../../../both/collections/profile.collection";
import {Router} from "@angular/router";

@Component({
    selector: 'side-menu',
    template,
    styles: [style]
})
export class SideMenuComponent implements OnInit {

    selected: number;
    typeChat:ChatType = ChatType.CHAT;
    typeGroup:ChatType = ChatType.GROUP;

    constructor(private router: Router) {}

    ngOnInit() {
        this.selected = 0;
    }

    button(value: number): void{
        this.selected = value;
    }


    logout() {
        Profiles.update(Meteor.user().profile.id, {$set: {status: Status.Offline}});
        Meteor.logout();
        this.router.navigate(['/']);
    }
}