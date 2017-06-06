import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./friend-request.component.html";
import style from "./friend-request.component.scss";
import {Observable, Subscription} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {FriendRequest, Profile, SessionKey} from "../../../../both/models";
import {FriendsRequest, Profiles} from "../../../../both/collections";

@Component({
    selector: 'friendRequest-list',
    template,
    styles: [style]
})
export class FriendRequestComponent implements OnInit, OnDestroy {

    friendsRequests: Observable<FriendRequest[]>;
    friendRequestsSub: Subscription;
    profileSub :Subscription;
    profiles: Observable<Profile[]>;
    numberRequest: number;

    ngOnInit(): void {
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest',Meteor.userId()).subscribe( () => {
            this.friendsRequests = FriendsRequest
                .find({destinator: Meteor.userId()});
            if (this.friendsRequests) {
                this.friendsRequests.subscribe(result => this.numberRequest = result.length);
            }
            this.friendsRequests.subscribe((requests : FriendRequest[]) => {
                for(let request of requests){
                    this.profileSub = MeteorObservable.subscribe('profiles', request.initiator).subscribe(() => {
                        console.log("Id initaitor:",request.initiator);
                        this.profiles = Profiles.find({userId : request.initiator});
                    });
                }
            });

        });

    }

    getUsernameFormId(id:string):string{
        let profile = Profiles.findOne({userId : id});
        if(profile){
            return profile.username;
        }
    }

    addNexContact(initiator: string): void {
        Meteor.call("newContact", initiator);
        Session.set(SessionKey.DataUpdated.toString(),true);
    }

    deleteRequest(initiator: string): void {
        Meteor.call("removeFriendRequest", initiator)
    }

    ngOnDestroy(): void {
        this.friendRequestsSub.unsubscribe();
        if(this.profileSub){
            this.profileSub.unsubscribe();
        }
    }
}