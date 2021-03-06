import {Component, NgZone, OnDestroy, OnInit, ViewChild} from "@angular/core";
import template from "./contact-list.component.html";
import style from "./contact-list.component.scss";
import {Router} from "@angular/router";
import {ContextMenuComponent} from "angular2-contextmenu";
import {Observable, Subscription} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {Contact, FriendRequest, Profile, SessionKey} from "../../../../both/models";
import {Contacts, FriendsRequest, Profiles} from "../../../../both/collections";

@Component({
    selector: 'contact-list',
    template,
    styles: [style]
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
    haveFriend: boolean = false;

    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    constructor(private zone: NgZone, private router: Router) {
    }

    ngOnInit(): void {
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                //this.friendRequests = FriendsRequest.find();
            });
        });
        this.dataloading();
        Tracker.autorun(() => {
            let updateData = Session.get(SessionKey.DataUpdated.toString());
            if (updateData === true) {
                this.dataloading();
                Session.set(SessionKey.DataUpdated.toString(), false);
            }
        });
    }

    dataloading(): void {
        this.currentUserId = Meteor.userId();
        this.friendRequestsSub = MeteorObservable.subscribe('friendRequest').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.friendRequests = FriendsRequest.find();
            });
        });

        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.profiles = Profiles
                    .find({userId: {$ne: this.currentUserId}});
                this.contactsSub = MeteorObservable.subscribe('myContacts').subscribe(() => {
                    this.contacts = Contacts.find();
                    if (this.contacts) {
                        this.contacts.subscribe((result: Contact[]) => {
                            MeteorObservable.autorun().subscribe(() => {
                                if (result) {
                                    this.zone.run(() => {
                                        this.haveFriend = false;
                                        for (let contact of result) {
                                            contact.profile = Profiles.findOne({_id: contact.profileId});
                                            if (contact.profile) {
                                                let picId: string = contact.profile.picture;
                                                contact.profile.picture = "";
                                                MeteorObservable.subscribe("file", picId).subscribe(() => {
                                                    MeteorObservable.autorun().subscribe(() => {
                                                        this.zone.run(() => {
                                                            contact.profile.picture = picId;
                                                        });
                                                    });
                                                });
                                            }
                                            this.haveFriend = true;
                                        }
                                    });
                                }
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
                this.contacts = Contacts.find({displayName: {$regex: ".*" + this.query + ".*"}});
                this.contacts.subscribe((result: Contact[]) => {
                    MeteorObservable.autorun().subscribe(() => {
                        if (result) {
                            this.zone.run(() => {
                                for (let contact of result) {
                                    contact.profile = Profiles.findOne({_id: contact.profileId});
                                    if (contact.profile) {
                                        let picId: string = contact.profile.picture;
                                        contact.profile.picture = "";
                                        MeteorObservable.subscribe("file", picId).subscribe(() => {
                                            MeteorObservable.autorun().subscribe(() => {
                                                this.zone.run(() => {
                                                    contact.profile.picture = picId;
                                                });
                                            });
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
                this.inApp = true;
            }
        } else {
            this.clearRequest(true);
        }
    }

    searchInQwirk(): void {
        this.contacts.subscribe((contactList: Contact[]) => {
            if (this.friendList.length > 0) {
                this.friendList = []
            }
            for (let contact of contactList) {
                this.friendList.push(contact.profileId);
            }
        });
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
        return !!FriendsRequest.collection.find({
                $and: [
                    {initiator: Meteor.userId()},
                    {destinator: friendId}
                ]
            }).count() || !!Contacts.collection.find({$and: [{ownerId: Meteor.userId()}, {friendId: friendId}]}).count();
    }

    clearRequest(bypass?:boolean): void {
        if (!this.query && !bypass) return;
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

    ngOnDestroy(): void {
        if (this.profilesSub) this.profilesSub.unsubscribe();
        if (this.friendRequestsSub) this.friendRequestsSub.unsubscribe();
        if (this.contactsSub) this.contactsSub.unsubscribe();
    }
}
