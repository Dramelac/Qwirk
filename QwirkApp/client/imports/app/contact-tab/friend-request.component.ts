import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import template from "./friend-request.component.html";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FriendRequest} from "../../../../both/models/friend-request.model";
import {MeteorObservable} from "meteor-rxjs";
import {FriendsRequest} from "../../../../both/collections/friend-request.collection";
import {Profile} from "../../../../both/models/profile.model";
import {Profiles} from "../../../../both/collections/profile.collection";

@Component({
    selector: 'friendRequest-list',
    template
})
export class FriendRequestComponent implements OnInit, OnDestroy {

    friendsRequests: Observable<FriendRequest[]>;
    friendRequestsSub: Subscription;
    profileSub :Subscription;
    profiles: Observable<Profile[]>;
    numberRequest: number;

    ngOnInit(): void {
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe( () => {
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
        console.log("Id :",id);
        if(profile){
            return profile.username;
        }else{
            return "error";
        }

    }

    addNexContact(initiator: string): void {
        Meteor.call("newContact", initiator);
        Session.set("dataUpdated",true);
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