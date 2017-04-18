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
    query: string;
    moreSearch: boolean = false;

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        let _id = Meteor.userId();
        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe();
        this.profiles = Profiles
            .find({userId: {$ne: _id}});
    }

    search(): void {
        this.profiles = Profiles.find({$and: [{username: {$regex: ".*" + this.query + ".*"}}, {userId: {$ne: Meteor.userId()}}]})
        this.moreSearch = true;
    }

    searchInQwirk(): void {
        if (this.query) {
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
    }

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
    }
}
