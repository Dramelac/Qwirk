import {Component, Input, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./status.component.html";
import style from "./status.component.scss";
import {Observable, Subscription} from "rxjs";
import {Profiles} from "../../../../both/collections";
import {Profile, StatusToColorCode, StatusToString} from "../../../../both/models";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'status',
    template,
    styles: [style]
})
export class StatusComponent implements OnDestroy, OnInit {
    @Input("profileId") profileId: string;
    @Input("usersId") usersId: string[];
    status: any[];
    profileSub: Subscription[];
    profiles: Observable<Profile[]>;

    constructor(private zone: NgZone) {

    };

    ngOnInit(): void {
        this.profileSub = [];
        this.status = [];
        if (this.profileId) {
            this.loadProfile(this.profileId);
        }
        if (this.usersId) {
            this.usersId.forEach((id) => {
                if (id !== Meteor.userId()) this.loadUserProfile(id)
            });
        }
    }

    loadProfile(id: string) {
        this.profileSub.push(MeteorObservable.subscribe("profileContact", id).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    let profile = Profiles.findOne({_id: id});
                    if (profile) {
                        this.status.push({
                            text: StatusToString(profile.status),
                            color: StatusToColorCode(profile.status)
                        });
                    }
                })
            });
        }));
    }

    loadUserProfile(id: string) {
        this.profileSub.push(MeteorObservable.subscribe("profiles", id).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    let profile = Profiles.findOne({userId: id});
                    if (profile) {
                        this.status.push({
                            text: StatusToString(profile.status),
                            color: StatusToColorCode(profile.status)
                        });
                    }
                })
            });
        }));
    }

    ngOnDestroy(): void {
        this.profileSub.forEach((sub) => {
            sub.unsubscribe()
        });
    }


}