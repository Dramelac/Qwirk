import {Component} from "@angular/core";
import template from "./index.component.html";
import {Router} from "@angular/router";

@Component({
    selector: 'qwirk-index',
    template
})
export class IndexComponent{

    constructor(private router: Router) {

    }


}
