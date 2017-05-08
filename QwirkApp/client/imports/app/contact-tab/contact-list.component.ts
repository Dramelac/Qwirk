import {Component, OnDestroy, OnInit, NgZone} from "@angular/core";
import template from "./contact-list.component.html";
import {Observable} from "rxjs";
import {Profile} from "../../../../both/models/profile.model";
import {MeteorObservable} from "meteor-rxjs";
import {Profiles} from "../../../../both/collections/profile.collection";
import {Subscription} from "rxjs/Subscription";
import {FriendRequest} from "../../../../both/models/friend-request.model";
import {FriendsRequest} from "../../../../both/collections/friend-request.collection";
import {StatusComponent} from "./status.component";

@Component({
    selector: 'contact-list',
    directives: [StatusComponent],
    template
})
export class ContactListComponent implements OnInit, OnDestroy {

    friendRequests: Observable<FriendRequest[]>;
    friendRequestsSub: Subscription;
    numberRequest: number;

    profiles: Observable<Profile[]>;
    profilesFind: Profile[];
    friendList: string[] = [];

    profilesSub: Subscription;
    query: string = null;
    moreSearch: boolean = false;
    inApp: boolean = false;
    currentUserId: string;
    private exist: boolean = false;

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        this.currentUserId = Meteor.userId();
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe();
        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe();
        this.profiles = Profiles
            .find({userId: {$ne: this.currentUserId}});

        if (this.profiles) {
            this.profiles.subscribe((result: Profile[]) => {
                for (var profile of result) {
                    this.friendList.push(profile._id);
                }
            });
        }

        this.friendRequests = FriendsRequest
            .find({destinator: Meteor.userId()});
        if (this.friendRequests) {
            this.friendRequests.subscribe(result => this.numberRequest = result.length);
        }
    }

    search(): void {
        if (this.query) {
            if (this.moreSearch) {
                this.searchInQwirk();
            } else {
                this.profiles = Profiles.find({$and: [{username: {$regex: ".*" + this.query + ".*"}}, {userId: {$ne: this.currentUserId}}]});
                this.inApp = true;
            }
        }
        if (this.query == "") {
            this.clearRequest();

        }
    }

    searchInQwirk(): void {
        Meteor.call("searchUser", this.query, this.friendList, (error, result) => {
            if (error) {
                console.log("erreur dans search")
            }
            if (result) {
                this.zone.run(() => {
                    this.profilesFind = result;
                });
            }
        });
    }

    sendFriendRequest(friendId: string): void {
        Meteor.call("addFriendRequest", friendId, (error, result) => {

        });
    }

    requestSent(friendId: string): boolean {
        Meteor.call("requestExist", friendId, (error, result) => {
            if (error) {
                console.log("erreur requestSent");
                return;
            }
            console.log("exist", result);
            Session.set('exist', result);
        });
        return Session.get('exist');

    }

    clearRequest(): void {
        this.query = null;
        this.profilesFind = null;
        this.profiles = Profiles.find({userId: {$ne: this.currentUserId}});
        this.moreSearch = false;
        this.inApp = false;
    }

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
        this.friendRequestsSub.unsubscribe();
    }
}
