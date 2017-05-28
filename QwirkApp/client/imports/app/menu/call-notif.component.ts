import {Component, OnDestroy, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";
import {Router} from "@angular/router";
import {CallRequest} from "../../../../both/models/call-request.model";
import {CallRequests} from "../../../../both/collections/call-request.collection";
import {Profiles} from "../../../../both/collections/profile.collection";
import template from "./call-notif.component.html";
import {Profile} from "../../../../both/models/profile.model";

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
                this.callRequest = CallRequests.find({targetUsersId:Meteor.userId()}).map((notifs: CallRequest[]) => {
                    notifs.forEach((notif) => {
                        //TODO update username to contact name
                        //TODO update to group name
                        let profile: Profile = Profiles.findOne({userId:notif.ownerUserId});
                        if (profile){
                            notif.ownerName = profile.username;
                        }
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
        Session.set("activeCall", request.chatId);
        Session.set("callId", request._id);
        Session.set("callVideo", request.video);
        CallRequests.update(request._id, {
            $pull:{targetUsersId:Meteor.userId()},
            $push:{onlineUsers:Meteor.userId()}
        });
        this.router.navigate(['/chat/'+request.chatId]);
    }

    refuseCall(request: CallRequest){
        CallRequests.update(request._id, {
            $pull:{targetUsersId:Meteor.userId()},
            $push:{rejectUsers:Meteor.userId()}
        });
    }
}