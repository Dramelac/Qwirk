import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./join-group.component.html";
import style from "./join-group.component.scss";
import {ActivatedRoute, Router} from "@angular/router";
import {Chats} from "../../../../both/collections/chat.collection";
import {Chat} from "../../../../both/models/chat.model";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'join-group',
    template,
    styles: [style]
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
        console.log(this.groupId);
        Chats.update({_id: this.groupId}, {$push: {user: Meteor.userId()}});
        this.router.navigate(["/group/" + this.groupId]);
    }

    cancel() {
        this.router.navigate(["/"]);
    }


}
