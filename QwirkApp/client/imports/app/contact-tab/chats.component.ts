import {Component, Input, OnDestroy, OnInit} from "@angular/core";
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
    @Input("type") type: string;
    chats: Observable<Chat[]>;
    profilesSub: Subscription[];
    chatSub: Subscription;
    contactSub: Subscription[];
    ngOnInit(): void {
        if(!this.type){
            this.type = "Chats";
        }
        console.log(this.type);
        this.profilesSub = [];
        this.contactSub = [];
        this.chatSub = MeteorObservable.subscribe('chats',this.type).subscribe(() => {
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

    constructor(private router: Router) {

    }

    findChats(): Observable<Chat[]> {
        return Chats.find({type : this.type}).map(chats => {
            chats.forEach(chat => {
                if (!chat.title && chat.user.length == 2 && chat.admin.length == 0) {
                    const receiverId = chat.user.find(m => m !== Meteor.userId());
                    this.profilesSub.push(MeteorObservable.subscribe('profiles', receiverId).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            let profile = Profiles.findOne({userId: receiverId});
                            this.contactSub.push(MeteorObservable.subscribe('contact',profile._id).subscribe(() => {
                                MeteorObservable.autorun().subscribe(() => {
                                    let contact = Contacts.findOne({profileId : profile._id});
                                    if (contact) {
                                        chat.title = contact.displayName;
                                        chat.picture = profile.picture;
                                        chat.blocked = contact.isBloqued;
                                    }
                                });
                            }));

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

    showMessages(chat: string): void {
        if(!this.type || this.type === "Chats"){
            this.router.navigate(["/chat/" + chat]);
        }
        if(this.type === "Groups"){
            this.router.navigate(["/group/" + chat]);
        }
    }

    createGroup() : void {
        this.router.navigate(["/addGroup"]);
    }
}
