import {Component, Input, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./status.component.html";
import style from "./status.component.scss";
import {Subscription, Observable} from "rxjs";
import {Profiles} from "../../../../both/collections";
import {Profile, StatusToString, StatusToColorCode} from "../../../../both/models";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'status',
    template,
    styles: [style]
})
export class StatusComponent implements OnDestroy, OnInit {
    @Input("profileId") profileId: string;
    status : string;
    colorCode: string;
    profileSub: Subscription;
    profiles: Observable<Profile[]>;

    constructor( private zone :NgZone){

    };
    ngOnInit(): void {
        this.profileSub = MeteorObservable.subscribe("profileContact",this.profileId).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    let profile = Profiles.findOne({_id : this.profileId});
                    if (profile){
                        this.status = StatusToString(profile.status);
                        this.colorCode = StatusToColorCode(profile.status);
                    }
                })
            });
        });
    }

    ngOnDestroy(): void {
        if(this.profileSub){
            this.profileSub.unsubscribe();
        }
    }


}