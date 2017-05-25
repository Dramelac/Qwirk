import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import style from "./user-status.component.scss";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile} from "../../../../both/models/profile.model";
import {Profiles} from "../../../../both/collections/profile.collection";
import {MeteorObservable} from "meteor-rxjs";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: "user-status",
    template,
    styles: [style]
})
@InjectUser('user')
export class UserStatusComponent implements OnInit, OnDestroy {
    profile: Profile;
    profilesub: Subscription;
    selectedStatus: number;

    pictureId: string;

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        this.loadingValue();
        //console.log("sub to profile :", Meteor.userId());
        this.subAction();
    }

    subAction(){
        this.profilesub = MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    this.profile = Profiles.findOne({userId: Meteor.userId()});
                    if (this.profile) {
                        this.selectedStatus = this.profile.status;
                        this.pictureId = "";
                        MeteorObservable.subscribe("file", this.profile.picture).subscribe(() => {
                            MeteorObservable.autorun().subscribe(() => {
                                this.pictureId = this.profile.picture;
                            });
                        });
                        //this.status = StatusToString(this.profile.status);
                    } else {
                        //console.log("profile not found, debug info :", Meteor.userId(), this.profile, this.profilesub);
                        if (Meteor.userId()){
                            console.log("Error loading profile");
                        } else {
                            this.loadingValue();
                        }
                    }
                });
            })
        });
    }

    ngOnDestroy(): void {
        this.profilesub.unsubscribe();
    }


    loadingValue(): void {
        this.profile = {
            username: "Loading"
        };
    }

    updateStatus(value): void {
        if (this.profile){
            Profiles.update(this.profile._id, {$set: {status: parseInt(value)}});
        } else {
            console.log("Error no profile selected.");
        }
    }
}
