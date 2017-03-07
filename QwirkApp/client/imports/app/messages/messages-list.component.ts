import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import { Messages } from '../../../../both/collections/message.collection';
import { Message } from '../../../../both/models/message.model';

import template from './messages-list.component.html';
import {ActivatedRoute} from "@angular/router";
import {Chat} from "../../../../both/models/chat.model";

@Component({
    selector: 'messages-list',
    template
})
export class MessagesListComponent implements OnInit, OnDestroy{
    chat: Chat;
    paramsSub: Subscription;
    messages: Observable<Message[]>;
    messagesSub: Subscription;

    constructor(private route: ActivatedRoute){}

    ngOnInit() {
        this.paramsSub = this.route.params
            .map(params => params["chat"])
            .subscribe(chat => {
                this.chat = chat;

                if (this.messagesSub){
                    this.messagesSub.unsubscribe();
                }

                this.messagesSub = MeteorObservable.subscribe('message', this.chat._id).subscribe();
            });

        this.messages = Messages.find(
            {chatId: this.chat._id},
            {sort: {createdAt: 1}}
        );
    }

    removeMessage(msg: Message): void {
        Messages.remove(msg._id);
    }

    ngOnDestroy() {
        this.messagesSub.unsubscribe();
    }
}