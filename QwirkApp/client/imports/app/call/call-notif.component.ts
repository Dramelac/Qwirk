import {Component, OnDestroy, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";
import {Router} from "@angular/router";
import {CallRequest, Chat, ChatType, Contact, Profile} from "../../../../both/models";
import {CallRequests, Chats, Contacts, Profiles} from "../../../../both/collections";
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
                this.callRequest = CallRequests.find({targetUsersId: Meteor.userId()}).map((notifs: CallRequest[]) => {
                    notifs.map((notif) => {
                        let chat: Chat = Chats.findOne({_id: notif.chatId});
                        if (chat) {
                            if (chat.type === ChatType.GROUP) {
                                notif.ownerName = chat.title;
                            } else {
                                let contact: Contact = Contacts.findOne({friendId: notif.ownerUserId});
                                if (contact) {
                                    notif.ownerName = contact.displayName;
                                } else {
                                    let profile: Profile = Profiles.findOne({userId: notif.ownerUserId});
                                    notif.ownerName = profile ? profile.username : "Unknown";
                                }
                            }
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

    acceptCall(request: CallRequest) {
        Session.set("activeCall", true);
        Session.set("callId", request._id);
        Session.set("callVideo", request.video);
        CallRequests.update(request._id, {
            $pull: {targetUsersId: Meteor.userId()},
            $push: {onlineUsers: Meteor.userId()}
        });
        this.router.navigate(['/chat/' + request.chatId]);
    }

    refuseCall(request: CallRequest) {
        CallRequests.update(request._id, {
            $pull: {targetUsersId: Meteor.userId()},
            $push: {rejectUsers: Meteor.userId()}
        });
    }
}