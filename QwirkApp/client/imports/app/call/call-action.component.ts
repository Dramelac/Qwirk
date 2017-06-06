import {Component, Input, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./call-action.component.html";
import style from "./call-action.component.scss";
import {CallRequest, Chat, SessionKey} from "../../../../both/models";
import {CallRequests} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'call-action',
    template,
    styles: [style]
})
export class CallActionComponent implements OnInit, OnDestroy {

    @Input("chat") chat: Chat;
    isCallActive: boolean;
    pendingCallRequest: CallRequest;

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
        MeteorObservable.subscribe('callrequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.pendingCallRequest = CallRequests.findOne({rejectUsers: Meteor.userId(),chatId: this.chat._id});
                if (this.pendingCallRequest){
                    console.log("Detect reject call");
                    this.isCallActive = true;
                }
            });
        });
    }

    ngOnDestroy(): void {

    }

    call(video: boolean): void {
        Session.set(SessionKey.LaunchCallChat.toString(), this.chat);
        Session.set(SessionKey.CallVideo.toString(), video);
        Session.set(SessionKey.IsHost.toString(), true);

        Session.set(SessionKey.ActiveCall.toString(), true);
    }

    join(){
        Session.set(SessionKey.ActiveCall.toString(), true);
        Session.set(SessionKey.CallId.toString(), this.pendingCallRequest._id);
        Session.set(SessionKey.CallVideo.toString(), this.pendingCallRequest.video);
    }

}