import {Component, OnDestroy, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {MeteorObservable} from "meteor-rxjs";
import {Chats, Messages} from "../../../../both/collections";
import {Message} from "../../../../both/models/message.model";
import template from "./messages-list.component.html";
import {ActivatedRoute, Router} from "@angular/router";
import {Chat} from "../../../../both/models/chat.model";
import {Profiles} from "../../../../both/collections/profile.collection";

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
    distantUserId: string;

    constructor(private route: ActivatedRoute, private router: Router){}

    ngOnInit() {
        this.paramsSub = this.route.params
            .map(params => params["chatId"])
            .subscribe(chat => {
                this.chatId = chat;
                Session.set("chatId", this.chatId);

                if (this.messagesSub){
                    this.messagesSub.unsubscribe();
                }

                this.messagesSub = MeteorObservable.subscribe('messages', this.chatId).subscribe();
                MeteorObservable.subscribe('chats').subscribe(()=>{
                    MeteorObservable.autorun().subscribe(() => {

                        this.chat = Chats.findOne(this.chatId);
                        if (!this.chat){
                            this.router.navigate(['/']);
                            return;
                        }
                        if (!this.chat.title && this.chat.user.length == 2 && this.chat.admin.length == 0) {
                            this.distantUserId = this.chat.user.find(m => m !== Meteor.userId());
                            MeteorObservable.subscribe('profiles', this.distantUserId).subscribe(() => {
                                let profile = Profiles.findOne({userId: this.distantUserId});
                                if (profile) {
                                    this.chat.title = profile.username;
                                    this.chat.picture = profile.picture;
                                    //TODO Add status user
                                }
                            });
                        }

                        this.messages = Messages.find(
                            {chatId: this.chatId},
                            {sort: {createdAt: 1}}
                        ).map((messages: Message[]) => {
                            messages.forEach((message) => {
                                message.ownership = Meteor.userId() == message.ownerId ? 'mine' : 'other';

                                return message;
                            });
                            return messages;
                        });

                    });
                });


            });

    }

    removeMessage(msg: Message): void {
        Messages.remove(msg._id);
    }

    ngOnDestroy() {
        this.messagesSub.unsubscribe();
    }
}