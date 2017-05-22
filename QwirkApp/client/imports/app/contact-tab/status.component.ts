import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import template from "./status.component.html";
import {StatusToString} from "../../../../both/models/status.enum";
@Component({
    selector: 'status',
    template
})

export class StatusComponent implements OnDestroy, OnInit {
    @Input("numberStatus") statusNumber: number;
    status : string;
    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.status = StatusToString(this.statusNumber)
    }

}