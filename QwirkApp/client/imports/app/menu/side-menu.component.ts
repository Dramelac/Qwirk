import {Component, OnInit} from "@angular/core";

import template from "./side-menu.component.html";
import {ChatType} from "../../../../both/models/chat.model";

@Component({
    selector: 'side-menu',
    template
})
export class SideMenuComponent implements OnInit {

    selected: number;
    typeChat:ChatType = ChatType.CHAT;
    typeGroup:ChatType = ChatType.GROUP;

    constructor() {}

    ngOnInit() {
        this.selected = 0;
    }

    button(value: number): void{
        this.selected = value;
    }
}