import {Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import template from "./chats.component.html";
import {Observable} from "rxjs/Observable";
import {Chat} from "../../../../both/models/chat.model";
import {Chats, Messages} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";
import {Message} from "../../../../both/models/message.model";
import {Subscriber, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {Profiles} from "../../../../both/collections/profile.collection";
import {MessagesListComponent} from "../messages/messages-list.component";
import {Contacts} from "../../../../both/collections/contact.collection";

@Component({
    selector: 'chat-list',
    template
})
export class ChatsComponent implements OnInit, OnDestroy {
    chats: Observable<Chat[]>;
    profilesSub: Subscription[];
    chatSub: Subscription;
    contactSub: Subscription[];
    ngOnInit(): void {
        this.profilesSub = [];
        this.contactSub = [];
        this.chatSub = MeteorObservable.subscribe('chats').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.chats = this.findChats();
            });
        });
    }

    ngOnDestroy(): void {
        this.chatSub.unsubscribe();
        this.profilesSub.forEach((sub) => {
            sub.unsubscribe();
        });
        this.contactSub.forEach((sub) => {
            sub.unsubscribe();
        });
    }

    constructor(private router: Router, private zone: NgZone) {

    }

    findChats(): Observable<Chat[]> {
        return Chats.find().map(chats => {
            chats.forEach(chat => {
                if (!chat.title && chat.user.length == 2 && chat.admin.length == 0) {
                    const receiverId = chat.user.find(m => m !== Meteor.userId());
                    this.profilesSub.push(MeteorObservable.subscribe('profiles', receiverId).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            let profile = Profiles.findOne({userId: receiverId});
                            if (profile){
                                this.contactSub.push(MeteorObservable.subscribe('contact',profile._id).subscribe(() => {
                                    MeteorObservable.autorun().subscribe(() => {
                                        let contact = Contacts.findOne({profileId : profile._id});
                                        if (contact) {
                                            chat.title = contact.displayName;
                                            chat.blocked = contact.isBloqued;
                                            chat.picture = "";
                                            MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                                                MeteorObservable.autorun().subscribe(() => {
                                                    console.log("yolo");
                                                    this.zone.run(()=>{
                                                        chat.picture = profile.picture;
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }));
                            }

                        });
                    }));
                }

                // This will make the last message reactive
                this.findLastChatMessage(chat._id).subscribe((message) => {
                    message.content = MessagesListComponent.processMessage(message.content);
                    chat.lastMessage = message;
                });
            });

            return chats;
        });
    }

    findLastChatMessage(chatId: string): Observable<Message> {
        return Observable.create((observer: Subscriber<Message>) => {
            const chatExists = () => !!Chats.findOne(chatId);

            // Re-compute until chat is removed
            MeteorObservable.autorun().takeWhile(chatExists).subscribe(() => {
                Messages.find({chatId}, {
                    sort: {createdAt: -1}
                }).subscribe({
                    next: (messages) => {
                        // Invoke subscription with the last message found
                        if (!messages.length) {
                            return;
                        }
                        const lastMessage = messages[0];
                        observer.next(lastMessage);
                    },
                    error: (e) => {
                        observer.error(e);
                    },
                    complete: () => {
                        observer.complete();
                    }
                });
            });
        });
    }

    removeChat(chat: Chat): void {
        MeteorObservable.call('removeChat', chat._id).subscribe({
            error: (e: Error) => {
                if (e) {
                    console.error(e);
                }
            }
        });
    }

    showMessages(chat: string): void {
        this.router.navigate(["/chat/" + chat]);
    }
}
