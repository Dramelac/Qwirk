import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./friend-request.component.html";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FriendRequest} from "../../../../both/models/friend-request.model";
import {MeteorObservable} from "meteor-rxjs";
import {FriendsRequest} from "../../../../both/collections/friend-request.collection";

@Component({
    selector: 'friendRequest-list',
    template
})
export class FriendRequestComponent implements OnInit,OnDestroy {

    friendsRequests: Observable<FriendRequest[]>;
    friendRequestsSub: Subscription;
    numberRequest: number;


    ngOnInit():void{
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe();
        this.friendsRequests = FriendsRequest
            .find({destinator: Meteor.userId()});
        if(this.friendsRequests){
            this.friendsRequests.subscribe(result => this.numberRequest = result.length);
        }
    }

    addNexContact(initiator :string):void{
        Meteor.call("newContact",initiator);
    }
    deleteRequest(initiator :string):void{
        Meteor.call("removeFriendRequest",initiator)
    }

    ngOnDestroy():void{
        this.friendRequestsSub.unsubscribe();
    }
}