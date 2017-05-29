import {Component, Input, OnDestroy, OnInit, NgZone} from "@angular/core";
import template from "./call-action.component.html";
import {Chat} from "../../../../both/models";

@Component({
    selector: 'call-action',
    template
})
export class CallActionComponent implements OnInit, OnDestroy {

    @Input("chat") chat: Chat;
    isCallActive: boolean;

    constructor(private zone:NgZone) {
    }

    ngOnInit(): void {
        this.isCallActive = false;
        Tracker.autorun(() => {
            let isCall = Session.get("activeCall");
            this.zone.run(()=>{
                this.isCallActive = isCall;
            });
        });
        //TODO check group call already reject
    }

    ngOnDestroy(): void {

    }

    call(video: boolean): void {
        Session.set("launchCall", this.chat);
        Session.set("callWithVideo", video);
        Session.set("isHost", true);

        Session.set("activeCall", true);
    }

}