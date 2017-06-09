import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./user-status.component.html";
import style from "./user-status.component.scss";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Profile, StatusToColorCode} from "../../../../both/models";
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

    color: string;
    pictureId: string;

    constructor(private zone: NgZone) {
    }

    ngOnInit(): void {
        this.loadingValue();
        //console.log("sub to profile :", Meteor.userId());
        setTimeout(() => {
            this.subAction();
        }, 100);
    }

    subAction() {
        this.profilesub = MeteorObservable.subscribe('profile').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    this.profile = Profiles.findOne({userId: Meteor.userId()});
                    if (this.profile) {
                        this.selectedStatus = this.profile.status;
                        this.color = StatusToColorCode(this.selectedStatus);
                        MeteorObservable.subscribe("file", this.profile.picture).subscribe(() => {
                            MeteorObservable.autorun().subscribe(() => {
                                this.pictureId = this.profile.picture;
                            });
                        });
                        //this.status = StatusToString(this.profile.status);
                    } else {
                        //console.log("profile not found, debug info :", Meteor.userId(), this.profile, this.profilesub);
                        if (!Meteor.userId()) {
                            this.loadingValue();
                        }
                    }
                });
            })
        });
    }

    ngOnDestroy(): void {
        if (this.profilesub) this.profilesub.unsubscribe();
    }


    loadingValue(): void {
        this.profile = {
            username: "Loading"
        };
        this.color = "green";
        this.pictureId = "";
    }

    updateStatus(value): void {
        if (this.profile) {
            value = parseInt(value);

            Profiles.update(this.profile._id, {$set: {status: value}});

            this.color = StatusToColorCode(value)

        } else {
            console.log("Error no profile selected.");
        }
    }

}
