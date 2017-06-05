import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./join-group.component.html";
import {ActivatedRoute, Router} from "@angular/router";
import {Chat} from "../../../../both/models/chat.model";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";
import {Chats} from "../../../../both/collections/chat.collection";
import _ = require("underscore");
@Component({
    selector: 'join-group',
    template
})

export class JoinGroupComponent implements OnInit, OnDestroy {

    paramSub: Subscription;
    groupSub: Subscription;
    group: Chat;
    groupId: string;
    isMember: boolean;

    constructor(private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.paramSub = this.route.params
            .map(params => params["groupId"])
            .subscribe(group => {
                this.groupId = group;
                if (this.groupId) {
                    this.groupSub = MeteorObservable.subscribe('chat', this.groupId).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            this.group = Chats.findOne({_id: this.groupId});
                            if (this.group) {
                                this.isMember = !!this.group.user;
                                if (!this.group.publicly) {
                                    this.cancel();
                                }
                            } else {
                                this.cancel();
                            }
                        });
                    });
                }
            });
    }

    ngOnDestroy(): void {
        if (this.paramSub) {
            this.paramSub.unsubscribe();
        }
        if (this.groupSub) {
            this.groupSub.unsubscribe();
        }
    }

    joinGroup() {
        Chats.update({_id: this.groupId}, {$push: {user: Meteor.userId()}});
        this.router.navigate(["/group/" + this.groupId]);
    }

    cancel() {
        this.router.navigate(["/"]);
    }


}