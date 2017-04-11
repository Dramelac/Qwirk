import {Component, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile} from "../../../../both/models/profile.model";

@Component({
    selector: "user-status",
    template
})
@InjectUser('user')
export class UserStatusComponent implements OnInit {
    profile: Profile;

    constructor() {
    }

    ngOnInit(): void {
        /*MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.profile = Profiles.findOne({userId: Meteor.userId()});
            });
        });*/
    }
}
