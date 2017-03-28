import {Component, OnInit, OnDestroy} from '@angular/core';
import template from './chats.component.html';
import {Observable} from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import {Chat} from "../../../../both/models/chat.model";
import {Chats, Messages} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'chat-list',
    template
})
export class ChatsComponent implements OnInit, OnDestroy {
    chats: Observable<Chat[]>;
    chatsSub: Subscription;
    messageSub: Subscription;

    ngOnInit(): void {
        this.chatsSub = MeteorObservable.subscribe('chats').subscribe();
        this.messageSub = MeteorObservable.subscribe('messages').subscribe();
        this.chats = Chats
            .find({})
            .mergeMap((chats: Chat[]) =>
                Observable.combineLatest(
                    ...chats.map((chat: Chat) =>
                        Messages
                            .find({chatId: chat._id})
                            .startWith(null)
                            .map(messages => {
                                if (messages) chat.lastMessage = messages[0];
                                return chat;
                            })
                    )
                )
            );
    }

    constructor() {

    }

    removeChat(chat: Chat): void {
        Chats.remove({_id: chat._id});
    }

    ngOnDestroy(): void {
        this.chatsSub.unsubscribe();
        this.messageSub.unsubscribe();
    }
}
