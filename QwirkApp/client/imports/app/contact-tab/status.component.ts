import {Component, Input, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./status.component.html";
import {StatusToString} from "../../../../both/models/status.enum";
import {Subscription} from "rxjs/Subscription";
import {Profiles} from "../../../../both/collections/profile.collection";
import {Profile} from "../../../../both/models/profile.model";
import {Observable} from "rxjs/Observable";
import {MeteorObservable} from "meteor-rxjs";
@Component({
    selector: 'status',
    template
})

export class StatusComponent implements OnDestroy, OnInit {
    @Input("profileId") profileId: string;
    status : string;
    profileSub: Subscription;
    profiles: Observable<Profile[]>;

    constructor( private zone :NgZone){

    };
    ngOnInit(): void {
        this.profileSub = MeteorObservable.subscribe("profileContact",this.profileId).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.zone.run(() => {
                    let profile = Profiles.findOne({_id : this.profileId});
                    this.status = StatusToString(profile.status);
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