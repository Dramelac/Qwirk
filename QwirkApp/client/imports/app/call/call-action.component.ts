import {Component, Input, OnDestroy, OnInit, NgZone} from "@angular/core";
import template from "./call-action.component.html";
import {Chat, SessionKey} from "../../../../both/models";

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
            let isCall = Session.get(SessionKey.ActiveCall.toString());
            this.zone.run(()=>{
                this.isCallActive = isCall;
            });
        });
        //TODO check group call already reject
    }

    ngOnDestroy(): void {

    }

    call(video: boolean): void {
        Session.set(SessionKey.LaunchCallChat.toString(), this.chat);
        Session.set(SessionKey.CallVideo.toString(), video);
        Session.set(SessionKey.IsHost.toString(), true);

        Session.set(SessionKey.ActiveCall.toString(), true);
    }

}