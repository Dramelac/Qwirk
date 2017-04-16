import {Component, OnDestroy, OnInit} from "@angular/core";
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
    test : Profile;
    profilesFind: Observable<Profile[]>;
    profilesSub: Subscription;
    currentUser = Meteor.user();


    ngOnInit(): void {
        let _id = this.currentUser._id;
        this.profilesSub = MeteorObservable.subscribe('profiles').subscribe();
        this.profiles = Profiles
            .find({});
        this.test = Profiles.findOne(_id);

    }

    search(username: string): void {
        if (username != null){
            Meteor.call("searchUser",username,(error, result) => {
                if (error){
                 console.log("erreur dans search")
                }
                if (result){
                    this.profilesFind = result;
                }

            });
        }
    }

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
    }
}
