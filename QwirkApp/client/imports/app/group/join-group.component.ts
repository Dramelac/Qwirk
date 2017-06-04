import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./join-group.component.html"
import {ActivatedRoute, Router} from "@angular/router";
import {Chat, ChatType} from "../../../../both/models/chat.model";
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
    group : Chat;
    groupId : string;

    constructor(private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.paramSub = this.route.params
            .map(params => params["groupId"])
            .subscribe(group => {
                this.groupId = group;
                if(this.groupId){
                    this.groupSub = MeteorObservable.subscribe('chat', this.groupId).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            this.group = Chats.findOne({_id : this.groupId});
                            if(!this.group.publicly){
                                this.cancel();
                            }
                            if(_.contains(this.group.user,Meteor.userId())){
                                this.router.navigate(["/group/" + this.groupId])
                            }
                        });
                    });
                }
            });

    }

    ngOnDestroy(): void {
        if(this.paramSub){
            this.paramSub.unsubscribe();
        }
        if(this.groupSub){
            this.groupSub.unsubscribe();
        }
    }

    joinGroup() {
        this.group.user.push(Meteor.userId());
        Chats.update({_id : this.groupId}, {$set : {user : this.group.user}});
        this.router.navigate(["/group/"+ this.groupId]);
    }

    cancel() {
        this.router.navigate(["/"]);
    }


}
