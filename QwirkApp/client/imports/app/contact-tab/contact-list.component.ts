import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./contact-list.component.html";
import {Observable} from "rxjs";
import {Profile} from "../../../../both/models/profile.model";
import {MeteorObservable} from "meteor-rxjs";
import {Profiles} from "../../../../both/collections/profile.collection";
import {Subscription} from "rxjs/Subscription";
import {FriendRequest} from "../../../../both/models/friend-request.model";
import {FriendsRequest} from "../../../../both/collections/friend-request.collection";
import {Router} from "@angular/router";
import {Contacts} from "../../../../both/collections/contact.collection";
import {Contact} from "../../../../both/models/contact.model";

@Component({
    selector: 'contact-list',
    template
})
export class ContactListComponent implements OnInit, OnDestroy {

    friendRequests: Observable<FriendRequest[]>;
    friendRequestsSub: Subscription;
    numberRequest: number;

    contacts: Observable<Contact[]>;
    profiles: Observable<Profile[]>;
    profilesFind: Profile[];
    friendList: string[] = [];

    profilesSub: Subscription;
    contactsSub: Subscription;
    query: string = null;
    moreSearch: boolean = false;
    inApp: boolean = false;
    currentUserId: string;
    private exist: boolean = false;

    constructor(private zone: NgZone, private router: Router) {
    }

    ngOnInit(): void {
        this.dataloading();
        Tracker.autorun(() => {
            let updateData = Session.get("dataUpdated");
            if (updateData === true) {
                console.log("detect update");
                this.dataloading();
                Session.set("dataUpdated", false);
            }
        });
    }

    dataloading(): void {
        this.currentUserId = Meteor.userId();
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe();

        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                console.log("refresh profile");
                this.profiles = Profiles
                    .find({userId: {$ne: this.currentUserId}});
                if (this.profiles) {
                    console.log('profiles : ', this.profiles);
                } else {
                    console.log('no profile found.');
                }
                this.contactsSub = MeteorObservable.subscribe('myContacts').subscribe(() => {
                    console.log("refresh contact");
                    this.contacts = Contacts.find();
                    if (this.contacts) {
                        this.contacts.subscribe((result: Contact[]) => {
                            MeteorObservable.autorun().subscribe(() => {
                                if(result){
                                    this.zone.run(() => {
                                        for(let contact of result){
                                            contact.profile = Profiles.findOne({_id : contact.profileId});
                                            console.log(contact.profile);
                                        }
                                    });
                                }
                                console.log("refresh Contact/Profile");
                            });
                        });
                    }
                });
            });
        });
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
                this.contacts= Contacts.find({displayName: {$regex: ".*" + this.query + ".*"}});
                this.inApp = true;
            }
        }
        if (this.query == "") {
            this.clearRequest();

        }
    }

    searchInQwirk(): void {
        this.contacts.subscribe((contactList : Contact[])=> {
            if(this.friendList.length > 0){
                this.friendList = []
            }
            for(let contact of contactList){
                this.friendList.push(contact.profileId);
            }
        });
        console.log("nb elem:",this.friendList.length);
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
        this.dataloading();
    }

    showMessages(chatId: string): void {
        this.router.navigate(["/chat/" + chatId]);

    }

    deleteContact(friendId: string) {
        Meteor.call("removeContact", friendId, (error, result) => {

        });
    }

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
        this.friendRequestsSub.unsubscribe();
        this.contactsSub.unsubscribe();
    }
}
