import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import 'rxjs/add/operator/map';

import { Messages } from '../../../../both/collections/message.collection';
import { Message } from '../../../../both/models/message.model';

import template from './message-details.component.html';

@Component({
    selector: 'message-details',
    template
})
export class MessageDetailsComponent implements OnInit, OnDestroy {
    messageId: string;
    paramsSub: Subscription;
    message: Message;
    messageSub: Subscription;

    constructor(
        private route: ActivatedRoute
    ){}

    ngOnInit() {
        this.paramsSub = this.route.params
            .map(params => params["messageId"])
            .subscribe(messageId => {
                this.messageId = messageId;

                if (this.messageSub){
                    this.messageSub.unsubscribe();
                }

                this.messageSub = MeteorObservable.subscribe('message', this.messageId).subscribe(() => {
                    this.message = Messages.findOne(this.messageId);
                });
            });

    }

    saveMessage() {
        if (!Meteor.userId()) {
            alert('Please log in to change this message');
            return;
        }

        Messages.update(this.message._id, {
            $set: {
                content: this.message.content
            }
        });
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
        this.messageSub.unsubscribe();
    }
}
