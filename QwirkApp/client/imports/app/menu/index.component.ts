import {Component, OnInit} from "@angular/core";
import template from "./index.component.html";

@Component({
    selector: 'qwirk-index',
    template
})
export class IndexComponent implements OnInit {

    hideIndex: boolean;

    constructor() {
    }

    ngOnInit(): void {
        this.hideIndex = false;
    }

    switchState(){
        this.hideIndex = !this.hideIndex;
    }


}
