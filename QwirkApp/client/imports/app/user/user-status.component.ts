import {Component, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile} from "../../../../both/models/profile.model";
import {StatusToString} from "../../../../both/models/status.enum";
import {Profiles} from "../../../../both/collections/profile.collection";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: "user-status",
    template
})
@InjectUser('user')
export class UserStatusComponent implements OnInit {
    profile: Profile;
    status: string;

    constructor() {
    }

    ngOnInit(): void {
        this.loadingValue();
        MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.profile = Profiles.findOne({userId: Meteor.userId()});
                if (this.profile){
                    this.status = StatusToString(this.profile.status);
                } else {
                    this.loadingValue();
                }
                //TODO add dropdows status change
            })
        });

    }

    loadingValue(): void{
        this.profile = {
            username: ""
        };
        this.status = "Loading"
    }

    updateStatus(statusValue: number){
        //TODO add status self update
    }
}
