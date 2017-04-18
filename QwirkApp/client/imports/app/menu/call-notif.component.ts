import {Component, OnDestroy, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";
import {Router} from "@angular/router";
import {CallRequest} from "../../../../both/models/call-request.model";
import {CallRequests} from "../../../../both/collections/call-request.collection";
import {Profiles} from "../../../../both/collections/profile.collection";
import template from "./call-notif.component.html";

@Component({
    selector: 'call-notif',
    template
})
export class CallNotifComponent implements OnInit, OnDestroy {

    callRequestSub: Subscription;
    callRequest: Observable<CallRequest[]>;

    constructor(private router: Router) {
    }

    ngOnInit() {
        this.callRequestSub = MeteorObservable.subscribe('callrequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.callRequest = CallRequests.find().map((notifs: CallRequest[]) => {
                    notifs.forEach((notif) => {
                        //TODO update username to contact name
                        notif.ownerName = Profiles.findOne({userId:notif.ownerUserId}).username;
                        return notif;
                    });
                    return notifs;
                });
            });
        });
    }

    ngOnDestroy() {
        this.callRequestSub.unsubscribe();
    }

    acceptCall(request: CallRequest){
        this.removeRequest(request._id);
        this.router.navigate(['/chat/'+request._id]);
    }

    refuseCall(request: CallRequest){
        this.removeRequest(request._id);
    }

    removeRequest(id: string){
        CallRequests.remove(id);
    }
}