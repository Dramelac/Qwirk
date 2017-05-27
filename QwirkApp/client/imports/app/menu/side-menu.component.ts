import {Component, OnInit} from "@angular/core";

import template from "./side-menu.component.html";
import {ChatType} from "../../../../both/models/chat.model";

@Component({
    selector: 'side-menu',
    template
})
export class SideMenuComponent implements OnInit {

    selected: number;
    type:ChatType;

    constructor() {}

    ngOnInit() {
        this.type = ChatType.CHAT;
        this.selected = 0;
    }

    button(value: number): void{
        if(value === 0){
            this.type = ChatType.CHAT;
        }else if(value === 2){
            this.type = ChatType.GROUP;
        }
        this.selected = value;
    }
}