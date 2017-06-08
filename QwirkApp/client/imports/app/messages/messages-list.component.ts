import {Component, OnDestroy, OnInit} from "@angular/core";
import {MeteorObservable} from "meteor-rxjs";
import {Observable, Subscriber, Subscription} from "rxjs";
import {Chats, Contacts, Files, Messages, Profiles} from "../../../../both/collections";
import {Chat, ChatType, Message, MessageType, StatusToString} from "../../../../both/models";
import template from "./messages-list.component.html";
import style from "./messages-list.component.scss";
import {ActivatedRoute, Router} from "@angular/router";
import * as Moment from "moment";
import * as Autolinker from "autolinker";
import "jquery";
import "jquery-ui";
import * as _ from "underscore";

@Component({
    selector: 'messages-list',
    template,
    styles: [style]
})
export class MessagesListComponent implements OnInit, OnDestroy {
    chatId: string;
    chat: Chat;
    paramsSub: Subscription;
    messagesDayGroups;
    messagesSub: Subscription;
    distantUserId: string;

    autoScroller: MutationObserver;
    messageLazyLoadingLevel: number = 0;
    loadingMessage: boolean;

    waitForRead: string[] = [];

    constructor(private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.autoScroller = this.autoScroll();
        this.paramsSub = this.route.params
                .map(params => params["chatId"])
            .subscribe(chat => {
                this.chatId = chat;

                Meteor.subscribe("files", this.chatId);
                this.messageSubscribe();

                MeteorObservable.call('countMessages', this.chatId).subscribe((messagesCount: number) => {
                    Observable
                    // Chain every scroll event
                        .fromEvent(document.getElementById("ChatList"), 'scroll')
                        // Remove the scroll listener once all messages have been fetched
                        .takeUntil(this.autoRemoveScrollListener(messagesCount))
                        // Filter event handling unless we're at the top of the page
                        .filter(() => !document.getElementById("ChatList").scrollTop)
                        // Prohibit parallel subscriptions
                        .filter(() => !this.loadingMessage)
                        // Invoke the messages subscription once all the requirements have been met
                        .forEach(() => this.messageSubscribe());
                });
            });
    }

    ngOnDestroy() {
        this.autoScroller.disconnect();
        this.messagesSub.unsubscribe();
    }

    messageSubscribe() {
        this.loadingMessage = true;
        if (this.messagesSub) {
            this.messagesSub.unsubscribe();
        }
        this.messagesSub = MeteorObservable.subscribe('messages', this.chatId, ++this.messageLazyLoadingLevel).subscribe();
        MeteorObservable.subscribe('chats').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {

                this.chat = Chats.findOne(this.chatId);
                if (!this.chat) {
                    this.router.navigate(['/']);
                    return;
                }
                this.chat.isAdmin = _.contains(this.chat.admin, Meteor.userId());
                if (this.chat.type === ChatType.CHAT) {
                    this.distantUserId = this.chat.user.find(m => m !== Meteor.userId());
                    MeteorObservable.subscribe('profiles', this.distantUserId).subscribe(() => {
                        MeteorObservable.autorun().subscribe(() => {
                            let profile = Profiles.findOne({userId: this.distantUserId});
                            if (profile && this.chat) {
                                this.chat.title = profile.username;

                                MeteorObservable.subscribe('contact',profile._id).subscribe(() => {
                                    MeteorObservable.autorun().subscribe(() => {
                                        let contact = Contacts.findOne({profileId : profile._id});
                                        if (contact) {
                                            this.chat.title = contact.displayName;
                                        }
                                    });
                                });
                                MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                                    MeteorObservable.autorun().subscribe(() => {
                                        this.chat.picture = profile.picture;

                                    });
                                });
                            }
                        });
                    });
                }

                this.messagesDayGroups = Messages.find(
                    {chatId: this.chatId},
                    {sort: {createdAt: 1}}
                ).map((messages: Message[]) => {
                    messages.forEach((message) => {
                        if (Meteor.userId() === message.ownerId) {
                            message.ownership = 'mine';
                        } else {
                            message.ownership = 'other';
                            MeteorObservable.subscribe('profiles', message.ownerId).subscribe(() => {
                                let profile = Profiles.findOne({userId: message.ownerId});
                                if (profile) {
                                    MeteorObservable.subscribe('contact',profile._id).subscribe(() => {
                                        MeteorObservable.autorun().subscribe(() => {
                                            let contact = Contacts.findOne({profileId : profile._id});
                                            if (contact) {
                                                message.ownerName = contact.displayName;
                                            }
                                        });
                                    });
                                    MeteorObservable.subscribe("file", profile.picture).subscribe(() => {
                                        MeteorObservable.autorun().subscribe(() => {
                                            message.ownerPictureId = profile.picture;
                                        });
                                    });
                                    message.ownerName = profile.username;
                                } else {
                                    console.log("Error loading distant profile");
                                }
                            });
                        }
                        message.content = MessagesListComponent.processMessage(message.content);
                        if (message.type == MessageType.WIZZ &&
                            Moment().isBefore(Moment(message.createdAt).add(1, "seconds"))) {
                            this.wizz();
                        }
                        if (!_.contains(message.readBy, Meteor.userId())) {
                            message.isNew = true;
                            if (!_.contains(this.waitForRead, message._id)){
                                this.updateReadStatus(message);
                            }
                        }
                        return message;
                    });

                    // create days groups
                    const dateFormat = 'D MMMM Y';
                    const groupedMessages = _.groupBy(messages, (message) => {
                        return Moment(message.createdAt).format(dateFormat);
                    });

                    // build object by day / messages list
                    return Object.keys(groupedMessages).map((timestamp: string) => {
                        return {
                            timestamp: timestamp,
                            messages: groupedMessages[timestamp]
                        };
                    });
                });
                this.loadingMessage = false;

            });

        });
    }

    updateReadStatus(msg: Message) {
        this.waitForRead.push(msg._id);
        setTimeout(()=>{
            Messages.update(msg._id, {$push: {readBy: Meteor.userId()}});
        },5000);
    }

    autoScroll(): MutationObserver {
        const autoScroller = new MutationObserver(this.scrollDown.bind(this));

        autoScroller.observe(document.getElementById("ChatList"), {
            childList: true,
            subtree: true
        });

        return autoScroller;
    }

    autoRemoveScrollListener<T>(messagesCount: number): Observable<T> {
        return Observable.create((observer: Subscriber<T>) => {
            Messages.find({chatId: this.chatId}).subscribe({
                next: (messages) => {
                    // Once all messages have been fetched
                    if (messagesCount !== messages.length) {
                        return;
                    }

                    // Signal to stop listening to the scroll event
                    observer.next();

                    // Finish the observation to prevent unnecessary calculations
                    observer.complete();
                },
                error: (e) => {
                    observer.error(e);
                }
            });
        });
    }


    scrollDown(): void {
        if (!this.loadingMessage) {
            let element = document.getElementById("ChatList");
            element.scrollTop = element.scrollHeight;
        }
    }


    wizz() {
        $("#ChatList").effect("shake", {times: 4, distance: 25, direction: "left"});
        setTimeout(()=>{this.scrollDown()},700);
        let audio = new Audio("asset/wizz.wav");
        audio.play();
    }

    static processMessage(msg: string): string {
        //console.log("before :", msg);
        msg = MessagesListComponent.processEmoji(msg);

        // italic
        msg = msg.replace(/\\([^\\]+)\\/g, "<i>$1</i>");
        // bold
        msg = msg.replace(/\*([^*]+)\*/g, "<b>$1</b>");
        // underline
        msg = msg.replace(/_([^_]+)_/g, "<u>$1</u>");
        // strike
        msg = msg.replace(/~([^~]+)~/g, "<del>$1</del>");

        // url
        msg = Autolinker.link(msg);

        // line
        msg = msg.replace(/\n\r?/g, '<br/>');

        //console.log("after :", msg);
        return msg;
    }

    static processEmoji(msg: string): string {
        //console.log("before :", msg);

        //Angel - ():)
        msg = msg.replace(/\(\):\)/g, "<img src='/emoticon/angel.png' class='emoticon' alt='angel'>");
        //Angry - è_é
        msg = msg.replace(/\(angry\)/g, "<img src='/emoticon/angry-2.png' class='emoticon' alt='angry'>");
        //Confused - :S / :s
        msg = msg.replace(/:-?[Ss]/g, "<img src='/emoticon/confused-3.png' class='emoticon' alt='confused'>");
        // :P / :P
        msg = msg.replace(/:-?[Pp]/g, "<img src='/emoticon/happy-6.png' class='emoticon' alt='happy'>");
        // :) / :-)
        msg = msg.replace(/:-?\)/g, "<img src='/emoticon/smile.png' class='emoticon' alt='smile'>");
        // :D / :d
        msg = msg.replace(/:-?[Dd]/g, "<img src='/emoticon/happy-8.png' class='emoticon' alt='very happy'>");
        // ^^ ^_^
        msg = msg.replace(/\^_?\^/g, "<img src='/emoticon/happy-9.png' class='emoticon' alt='very happy'>");
        // :* :-*
        msg = msg.replace(/:-?\*/g, "<img src='/emoticon/kiss-1.png' class='emoticon' alt='kiss'>");
        // xD XD xd
        msg = msg.replace(/[xX]-?[dD]/g, "<img src='/emoticon/laughing-1.png' class='emoticon' alt='laughing'>");
        // :( :-(
        msg = msg.replace(/:-?\(/g, "<img src='/emoticon/sad-1.png' class='emoticon' alt='sad'>");
        // ;( ;-( :'-(
        msg = msg.replace(/(;|:')-?\(/g, "<img src='/emoticon/sad-3.png' class='emoticon' alt='cry'>");
        // :/ :-/
        msg = msg.replace(/:-?\/(?!\/)/g, "<img src='/emoticon/sceptic-4.png' class='emoticon' alt='sceptic'>");
        // -_-
        msg = msg.replace(/-_-/g, "<img src='/emoticon/sceptic-5.png' class='emoticon' alt='sceptic'>");
        // :X :x
        msg = msg.replace(/:-?[Xx]/g, "<img src='/emoticon/secret.png' class='emoticon' alt='secret'>");
        // :O :o
        msg = msg.replace(/:-?[Oo]/g, "<img src='/emoticon/shocked-2.png' class='emoticon' alt='shocked'>");
        // XO Xo xo xO
        msg = msg.replace(/[Xx][Oo]/g, "<img src='/emoticon/shocked-3.png' class='emoticon' alt='shocked'>");
        // XS xs
        msg = msg.replace(/[Xx][Ss]/g, "<img src='/emoticon/sick-2.png' class='emoticon' alt='sick'>");
        // ;) / ;-)
        msg = msg.replace(/;-?\)/g, "<img src='/emoticon/winking.png' class='emoticon' alt='winking'>");
        // ;p / ;-P
        msg = msg.replace(/;-?[Pp]/g, "<img src='/emoticon/wink-1.png' class='emoticon' alt='wink'>");
        // (rich) $_$
        msg = msg.replace(/(\(rich\)|\$_\$)/g, "<img src='/emoticon/rich.png' class='emoticon' alt='rich'>");

        //console.log("after :", msg);
        return msg;
    }

    removeMessage(msg: Message): void {
        if (msg.type === MessageType.PICTURE || msg.type === MessageType.FILE) {
            Files.remove({_id: msg.content});
        }
        Messages.remove(msg._id);
    }
}