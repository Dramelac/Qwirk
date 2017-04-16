import {Component, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile} from "../../../../both/models/profile.model";
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
    selectedStatus: number;

    constructor() {
    }

    ngOnInit(): void {
        this.loadingValue();
        MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.profile = Profiles.findOne({userId: Meteor.userId()});
                if (this.profile){
                    this.selectedStatus = this.profile.status;
                    //this.status = StatusToString(this.profile.status);
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

    updateStatus(value): void{
        Profiles.update(Meteor.user().profile.id, {$set: {status: parseInt(value)}});
    }
}
