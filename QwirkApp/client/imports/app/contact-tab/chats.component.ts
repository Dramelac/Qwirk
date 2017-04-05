import {Component, OnInit} from "@angular/core";
import template from "./chats.component.html";
import {Observable} from "rxjs/Observable";
import {Chat} from "../../../../both/models/chat.model";
import {Chats, Messages} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";
import {Message} from "../../../../both/models/message.model";
import {Subscriber} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'chat-list',
    template
})
export class ChatsComponent implements OnInit {
    chats: Observable<Chat[]>;

    ngOnInit(): void {
        MeteorObservable.subscribe('chats').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.chats = this.findChats();
            });
        });
    }

    constructor(private router: Router) {

    }

    findChats(): Observable<Chat[]> {
        return Chats.find().map(chats => {
            chats.forEach(chat => {
                if (chat.title == ""){
                    const receiverId = chat.user.find(m => m !== Meteor.userId());
                    const receiver = Meteor.users.findOne(receiverId);

                    if (receiver) {
                        chat.title = receiver.profile.name;
                        chat.picture = receiver.profile.picture;
                    }
                }

                // This will make the last message reactive
                this.findLastChatMessage(chat._id).subscribe((message) => {
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
                Messages.find({ chatId }, {
                    sort: { createdAt: -1 }
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
        this.router.navigate(["/chat/"+chat]);
    }
}
