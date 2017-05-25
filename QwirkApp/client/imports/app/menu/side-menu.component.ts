import {Component, OnInit} from "@angular/core";

import template from "./side-menu.component.html";

@Component({
    selector: 'side-menu',
    template
})
export class SideMenuComponent implements OnInit {

    selected: number;
    type:string;

    constructor() {}

    ngOnInit() {
        this.selected = 0;
    }

    button(value: number): void{
        this.selected = value;
        if(this.selected === 0){
            this.type = "Chats";
        }else if(this.selected === 2){
            this.type = "Groups";
        }
    }
}