import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import { Messages, Chats } from '../../../../both/collections';
import { Message } from '../../../../both/models/message.model';

import template from './messages-list.component.html';
import {ActivatedRoute} from "@angular/router";
import {Chat} from "../../../../both/models/chat.model";

@Component({
    selector: 'messages-list',
    template
})
export class MessagesListComponent implements OnInit, OnDestroy{
    chatId: string;
    chat: Chat;
    paramsSub: Subscription;
    messages: Observable<Message[]>;
    messagesSub: Subscription;

    constructor(private route: ActivatedRoute){}

    ngOnInit() {
        this.paramsSub = this.route.params
            .map(params => params["chatId"])
            .subscribe(chat => {
                this.chatId = chat;

                if (this.messagesSub){
                    this.messagesSub.unsubscribe();
                }

                this.messagesSub = MeteorObservable.subscribe('messages', this.chatId).subscribe();
            });

        this.chat = Chats.findOne(this.chatId);
        this.messages = Messages.find(
            {chatId: this.chatId},
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