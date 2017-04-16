import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile} from "../../../../both/models/profile.model";
import {Profiles} from "../../../../both/collections/profile.collection";
import {MeteorObservable} from "meteor-rxjs";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: "user-status",
    template
})
@InjectUser('user')
export class UserStatusComponent implements OnInit, OnDestroy {
    profile: Profile;
    profilesub: Subscription;
    status: string;
    selectedStatus: number;

    constructor() {
    }

    ngOnInit(): void {
        this.loadingValue();
        this.profilesub = MeteorObservable.subscribe('profile').subscribe(() => {
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

    ngOnDestroy(): void {
        this.profilesub.unsubscribe();
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
