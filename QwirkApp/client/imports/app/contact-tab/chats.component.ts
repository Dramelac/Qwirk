import {Component, OnInit, OnDestroy} from '@angular/core';
import template from './chats.component.html';
import {Observable} from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import {Chat} from "../../../../both/models/chat.model";
import {Chats} from "../../../../both/collections/chat.collection";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'chat-list',
    template
})
export class ChatsComponent implements OnInit, OnDestroy {
    chats: Observable<Chat[]>;
    chatsSub: Subscription;

    ngOnInit(): void {
        this.chats = Chats.find({}).zone();
        this.chatsSub = MeteorObservable.subscribe('chats').subscribe();
    }

    constructor() {

    }

    removeChat(chat: Chat): void {
        Chats.remove({_id: chat._id}).subscribe(() => {});
    }

    ngOnDestroy(): void {
        this.chatsSub.unsubscribe();
    }
}
