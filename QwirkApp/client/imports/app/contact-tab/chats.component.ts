import {Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from "@angular/core";
import template from "./chats.component.html";
import {Observable} from "rxjs/Observable";
import {Chat, ChatType, Message} from "../../../../both/models";
import {Chats, Contacts, Messages, Profiles} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";
import {Subscriber, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {MessagesListComponent} from "../messages/messages-list.component";
import {ContextMenuComponent} from "angular2-contextmenu";
import * as _ from "underscore";
import * as Moment from "moment";

//Remove typing false positive
declare let Notification: any;

@Component({
    selector: 'chat-list',
    template
})
export class ChatsComponent implements OnInit, OnDestroy {
    @Input("type") type: ChatType;
    chats: Observable<Chat[]>;
    profilesSub: Subscription[];
    chatSub: Subscription;
    contactSub: Subscription[];

    @ViewChild(ContextMenuComponent) public chatMenu: ContextMenuComponent;

    ngOnInit(): void {
        if(!this.type){
            this.type = null;
        }
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
        return Chats.find({type : this.type}).map(chats => {
            chats.forEach(chat => {
                if (chat.type === ChatType.CHAT) {
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
                    if (!_.contains(message.readBy, Meteor.userId())) {
                        message.isNew = true;
                        if (Moment().isBefore(Moment(message.createdAt).add(5, "seconds"))) {
                            this.notifMesage(chat.title);
                        }
                    }
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

    notifMesage(name: string) {
        if (Notification.permission === "granted") {
            let notification = new Notification("Qwirk",{
                icon: "favicon.png",
                body: name + " send you a message."
            });
            setTimeout(()=>{
                notification.close();
            }, 3500)
        }
        //let audio = new Audio("/asset/wizz.wav");
        //audio.play();
    }

    showMessages(chat: string): void {
        if(this.type === ChatType.CHAT){
            this.router.navigate(["/chat/" + chat]);
        }
        else if(this.type === ChatType.GROUP){
            this.router.navigate(["/group/" + chat]);
        }
    }

    createGroup() : void {
        this.router.navigate(["/addGroup"]);
    }
}
