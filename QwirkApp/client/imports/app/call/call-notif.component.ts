import {Component, OnDestroy, OnInit} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {Router} from "@angular/router";
import {CallRequest, Chat, ChatType, Contact, Profile, SessionKey} from "../../../../both/models";
import {CallRequests, Chats, Contacts, Profiles} from "../../../../both/collections";
import template from "./call-notif.component.html";
import style from "./call-notif.component.scss";

@Component({
    selector: 'call-notif',
    template,
    styles: [style]
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
        Session.set(SessionKey.ActiveCall.toString(), true);
        Session.set(SessionKey.CallId.toString(), request._id);
        Session.set(SessionKey.CallVideo.toString(), request.video);
        this.router.navigate(['/chat/' + request.chatId]);
    }

    refuseCall(request: CallRequest) {
        CallRequests.update(request._id, {
            $pull: {targetUsersId: Meteor.userId()},
            $push: {rejectUsers: Meteor.userId()}
        });
    }
}