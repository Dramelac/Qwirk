import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./contact-list.component.html";
import {Observable} from "rxjs";
import {Profile} from "../../../../both/models/profile.model";
import {MeteorObservable} from "meteor-rxjs";
import {Profiles} from "../../../../both/collections/profile.collection";
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'contact-list',
    template
})
export class ContactListComponent implements OnInit, OnDestroy {

    profiles: Observable<Profile[]>;
    profilesSub: Subscription;
    name: string;

    ngOnInit(): void {
        this.profilesSub = MeteorObservable.subscribe('profiles').subscribe();
        this.profiles = Profiles
            .find({});

    }

    search() {

        let test = Profiles.findOne("wrj99uZYnbkL2jJwi");
        test.contacts.length
    }

    ngOnDestroy(): void {
        this.profilesSub.unsubscribe();
    }
}
