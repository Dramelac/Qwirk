import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./add-group.component.html";

@Component({
    selector: 'add-group',
    template
})

export class AddGroupComponent implements OnInit, OnDestroy {
    ngOnInit(): void {
        console.log("Coucou")
    }

    ngOnDestroy(): void {
    }


}
