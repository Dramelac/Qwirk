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
    profilesFind:Profile[];
    profilesSub: Subscription;
    query: string;

    constructor(private zone: NgZone){
    }

    ngOnInit(): void {
        let _id = Meteor.userId();
        this.profilesSub = MeteorObservable.subscribe('profileContact').subscribe();
        this.profiles = Profiles
            .find({});
    }

    search(): void {
        if (this.query){
            Meteor.call("searchUser",this.query,(error, result) => {
                if (error){
                    console.log("erreur dans search")
                }
                if (result){
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
