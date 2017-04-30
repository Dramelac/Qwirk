import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./friend-request.component.html";
import {Observable} from "rxjs/Observable";
import {Subscriber, Subscription} from "rxjs";
import {FriendRequest} from "../../../../both/models/friend-request.model";

@Component({
    selector: 'friendRequest-list',
    template
})
export class FriendRequestComponent implements OnInit,OnDestroy {

    friendsRequests: Observable<FriendRequest[]>;
    friendRequestSub: Subscription;


    ngOnInit():void{

    }

    ngOnDestroy():void{
        this.friendRequestSub.unsubscribe();
    }
}