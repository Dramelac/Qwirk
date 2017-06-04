import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./add-group.component.html";
import {Contact} from "../../../../both/models/contact.model";
import {Contacts} from "../../../../both/collections/contact.collection";
import {MeteorObservable} from "meteor-rxjs";
import {Subscription} from "rxjs/Subscription";
import * as _ from "underscore";
import {Chats} from "../../../../both/collections/chat.collection";
import {Chat, ChatType} from "../../../../both/models/chat.model";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'add-group',
    template
})

export class AddGroupComponent implements OnInit, OnDestroy {

    groupId: string;
    group: Chat;
    groupTitle: string = null;
    query: string = null;
    contactsSub: Subscription;
    paramSub: Subscription;
    contactFiltred: Contact[] = [];
    mySelection: Contact[] = [];
    selected: string[];
    error: boolean;

    constructor(private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.contactsSub = MeteorObservable.subscribe('myContacts').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
            });
        });
        this.paramSub = this.route.params
            .map(params => params["groupId"])
            .subscribe(group => {
                this.groupId = group;

                this.group = Chats.collection.findOne({_id : this.groupId});
                if(this.group){
                    this.groupTitle = this.group.title;
                }
            });
    }

    ngOnDestroy(): void {
        if (this.contactsSub) {
            this.contactsSub.unsubscribe();
        }
        if(this.paramSub){
            this.paramSub.unsubscribe();
        }
    }

    filter() {
        if (this.query !== "") {
            Contacts.find({displayName: {$regex: ".*" + this.query + ".*"}}).subscribe(contacts => {
                if(this.group){
                    for(let contact of contacts){
                        if(!_.contains(this.group.user,contact.friendId)){
                            this.contactFiltred.push(contact);
                        }
                    }
                } else {
                    this.contactFiltred = contacts;
                }
            });

        } else {
            this.contactFiltred = [];
        }
    }

    select(contact: Contact) {
        if (!_.contains(this.mySelection.map((u) => {
                return u._id
            }), contact._id)) {
            this.mySelection.push(contact);
            this.query = '';
            this.contactFiltred = [];
        }
    }

    remove(contact: Contact) {
        let index = this.mySelection.indexOf(contact);
        if (index > -1) {
            this.mySelection.splice(index, 1);
            //console.log("index : ", this.mySelection.indexOf(contact));
            //console.log("taille liste : ", this.mySelection.length)
        }
    }

    addGroup() {
        if (this.mySelection.length > 0) {
            let listUserId = this.mySelection.map((u) => {
                return u.friendId
            });
            listUserId.push(Meteor.userId());
            let adminList = [];
            adminList.push(Meteor.userId());

            let newOwnerId = Meteor.userId();
            if (!this.groupTitle) {
                this.mySelection.map((u) => {
                    if (this.groupTitle) {
                        this.groupTitle = this.groupTitle + ", " + u.displayName;
                    } else {
                        this.groupTitle = u.displayName;
                    }
                });
            }

            let chat = Chats.collection.insert({
                user: listUserId,
                admin: adminList,
                publicly: false,
                type: ChatType.GROUP,
                title: this.groupTitle,
                ownerId: newOwnerId
            });
            this.router.navigate(["/group/" + chat]);
        } else {
            this.error = true;
        }
    }

    updateGroup(){
        if (this.mySelection.length > 0) {
           this.mySelection.map((u) => {
                this.group.user.push(u.friendId);
            });
            Chats.update({_id : this.group._id},{$set : {user : this.group.user}});
        }
        if(this.groupTitle !== this.group.title){
           Chats.update({_id : this.group._id},{$set : {title : this.groupTitle}});
        }
        this.router.navigate(["/group/" + this.groupId]);
    }
}
