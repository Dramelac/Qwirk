import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

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

    constructor(
        private route: ActivatedRoute
    ){}

    ngOnInit() {
        this.paramsSub = this.route.params
            .map(params => params["messageId"])
            .subscribe(messageId => {
                this.messageId = messageId;
                this.message = Messages.findOne(this.messageId);
            });

    }

    saveMessage() {
        Messages.update(this.message._id, {
            $set: {
                content: this.message.content,
                user: this.message.user,
            }
        });
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}
