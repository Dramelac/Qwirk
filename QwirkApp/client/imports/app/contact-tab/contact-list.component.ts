import {Component, OnDestroy, OnInit, NgZone} from "@angular/core";
import template from "./contact-list.component.html";
import {Observable} from "rxjs";
import {Profile} from "../../../../both/models/profile.model";
import {MeteorObservable} from "meteor-rxjs";
import {Profiles} from "../../../../both/collections/profile.collection";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'contact-list',
    template
})
export class ContactListComponent implements OnInit, OnDestroy {

    profiles: Observable<Profile[]>;
    profilesFind: Profile[];
    profilesSub: Subscription;
    query: string = null;
    moreSearch: boolean = false;
    inQwirk: boolean = false;

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        let _id = Meteor.userId();
        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe();
        this.profiles = Profiles
            .find({userId: {$ne: _id}});
    }

    search(): void {
        if (this.query) {
            if (this.moreSearch) {
                this.searchInQwirk();
            } else {
                this.profiles = Profiles.find({$and: [{username: {$regex: ".*" + this.query + ".*"}}, {userId: {$ne: Meteor.userId()}}]});
                this.inQwirk = true;
            }
        }
    }

    searchInQwirk(): void {
        Meteor.call("searchUser", this.query, (error, result) => {
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

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
    }
}
