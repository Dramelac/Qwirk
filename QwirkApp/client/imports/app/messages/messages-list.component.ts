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
import * as Autolinker from "autolinker";

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
                                message.content = MessagesListComponent.processMessage(message.content);

                                return message;
                            });
                            return messages;
                        });

                    });
                });


            });

    }

    static processMessage(msg: string): string{
        //console.log("before :", msg);
        msg = MessagesListComponent.processEmoji(msg);

        // italic
        msg = msg.replace(/\\([^\\]+)\\/g,"<i>$1</i>");
        // bold
        msg = msg.replace(/\*([^*]+)\*/g,"<b>$1</b>");
        // underline
        msg = msg.replace(/_([^_]+)_/g,"<u>$1</u>");
        // strike
        msg = msg.replace(/~([^~]+)~/g,"<del>$1</del>");

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
        msg = msg.replace(/\(\):\)/g,"<img src='/emoticon/angel.png' class='emoticon' alt='angel'>");
        //Angry - è_é
        msg = msg.replace(/\(angry\)/g,"<img src='/emoticon/angry-2.png' class='emoticon' alt='angry'>");
        //Confused - :S / :s
        msg = msg.replace(/:-?[Ss]/g,"<img src='/emoticon/confused-3.png' class='emoticon' alt='confused'>");
        // :P / :P
        msg = msg.replace(/:-?[Pp]/g,"<img src='/emoticon/happy-6.png' class='emoticon' alt='happy'>");
        // :) / :-)
        msg = msg.replace(/:-?\)/g,"<img src='/emoticon/smile.png' class='emoticon' alt='smile'>");
        // :D / :d
        msg = msg.replace(/:-?[Dd]/g,"<img src='/emoticon/happy-8.png' class='emoticon' alt='very happy'>");
        // ^^ ^_^
        msg = msg.replace(/\^_?\^/g,"<img src='/emoticon/happy-9.png' class='emoticon' alt='very happy'>");
        // :* :-*
        msg = msg.replace(/:-?\*/g,"<img src='/emoticon/kiss-1.png' class='emoticon' alt='kiss'>");
        // xD XD xd
        msg = msg.replace(/[xX]-?[dD]/g,"<img src='/emoticon/laughing-1.png' class='emoticon' alt='laughing'>");
        // :( :-(
        msg = msg.replace(/:-?\(/g,"<img src='/emoticon/sad-1.png' class='emoticon' alt='sad'>");
        // ;( ;-( :'-(
        msg = msg.replace(/(;|:')-?\(/g,"<img src='/emoticon/sad-3.png' class='emoticon' alt='cry'>");
        // :/ :-/
        msg = msg.replace(/:-?\//g,"<img src='/emoticon/sceptic-4.png' class='emoticon' alt='sceptic'>");
        // -_-
        msg = msg.replace(/-_-/g,"<img src='/emoticon/sceptic-5.png' class='emoticon' alt='sceptic'>");
        // :X :x
        msg = msg.replace(/:-?[Xx]/g,"<img src='/emoticon/secret.png' class='emoticon' alt='secret'>");
        // :O :o
        msg = msg.replace(/:-?[Oo]/g,"<img src='/emoticon/shocked-2.png' class='emoticon' alt='shocked'>");
        // XO Xo xo xO
        msg = msg.replace(/[Xx][Oo]/g,"<img src='/emoticon/shocked-3.png' class='emoticon' alt='shocked'>");
        // XS xs
        msg = msg.replace(/[Xx][Ss]/g,"<img src='/emoticon/sick-2.png' class='emoticon' alt='sick'>");
        // ;) / ;-)
        msg = msg.replace(/;-?\)/g,"<img src='/emoticon/winking.png' class='emoticon' alt='winking'>");
        // ;p / ;-P
        msg = msg.replace(/;-?[Pp]/g,"<img src='/emoticon/wink-1.png' class='emoticon' alt='wink'>");
        // (rich) $_$
        msg = msg.replace(/(\(rich\)|\$_\$)/g,"<img src='/emoticon/rich.png' class='emoticon' alt='rich'>");

        //console.log("after :", msg);
        return msg;
    }

    removeMessage(msg: Message): void {
        Messages.remove(msg._id);
    }

    ngOnDestroy() {
        this.messagesSub.unsubscribe();
    }
}