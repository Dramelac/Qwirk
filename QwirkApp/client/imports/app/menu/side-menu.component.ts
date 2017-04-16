import {Component, OnInit} from "@angular/core";

import template from "./side-menu.component.html";

@Component({
    selector: 'side-menu',
    template
})
export class SideMenuComponent implements OnInit {

    selected: number;

    constructor() {}

    ngOnInit() {
        this.selected = 0;
    }

    button(value: number): void{
        this.selected = value;
    }
}