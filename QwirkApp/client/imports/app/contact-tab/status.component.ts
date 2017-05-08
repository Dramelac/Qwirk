import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./status.component.html";
import model from "./contact-list.component.html"

@Component({
    selector: 'status',
    inputs:[model],
    template
})

export class StatusComponent implements OnDestroy, OnInit {
    status : string;
    ngOnDestroy(): void {
        status = this.status
    }

    ngOnInit(): void {
    }

}