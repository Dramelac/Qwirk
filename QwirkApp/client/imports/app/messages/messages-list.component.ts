import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import { Messages } from '../../../../both/collections/message.collection';
import { Message } from '../../../../both/models/message.model';

import template from './messages-list.component.html';

@Component({
    selector: 'messages-list',
    template
})
export class MessagesListComponent implements OnInit, OnDestroy{
    messages: Observable<Message[]>;
    messagesSub: Subscription;

    ngOnInit() {
        this.messages = Messages.find({}).zone();
        this.messagesSub = MeteorObservable.subscribe('messages').subscribe();
    }

    removeMessage(msg: Message): void {
        Messages.remove(msg._id);
    }

    ngOnDestroy() {
        this.messagesSub.unsubscribe();
    }
}