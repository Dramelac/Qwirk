import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./add-group.component.html";
import {Chat, ChatType, Contact, File} from "../../../../both/models";
import {Chats, Contacts, Files} from "../../../../both/collections";
import {MeteorObservable} from "meteor-rxjs";
import {Subscription} from "rxjs/Subscription";
import * as _ from "underscore";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'add-group',
    template
})

export class AddGroupComponent implements OnInit, OnDestroy {

    groupId: string;
    group: Chat;
    groupTitle: string = null;
    groupPictureId: string;
    query: string = null;
    contactsSub: Subscription;
    paramSub: Subscription;
    contactFiltred: Contact[] = [];
    mySelection: Contact[] = [];
    selected: string[];
    error: boolean;
    publicly: boolean = false;
    isAdmin: boolean;

    errorMessage: string;
    successMessage: string;

    constructor(private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.contactsSub = MeteorObservable.subscribe('myContacts').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
            });
        });
        this.errorMessage = "";
        this.successMessage = "";
        this.paramSub = this.route.params
            .map(params => params["groupId"])
            .subscribe(group => {
                this.groupId = group;

                MeteorObservable.subscribe('adminChat', this.groupId).subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        this.group = Chats.collection.findOne({_id: this.groupId});
                        if (this.group) {
                            MeteorObservable.subscribe("file", this.group.picture).subscribe(() => {
                                MeteorObservable.autorun().subscribe(() => {
                                    this.groupPictureId = this.group.picture;
                                });
                            });
                            this.groupTitle = this.group.title;
                            this.publicly = this.group.publicly;
                            this.isAdmin = _.contains(this.group.admin, Meteor.userId());
                        } else {
                            this.isAdmin = true;
                        }
                    });
                });
            });
    }

    ngOnDestroy(): void {
        if (this.contactsSub) {
            this.contactsSub.unsubscribe();
        }
        if (this.paramSub) {
            this.paramSub.unsubscribe();
        }
    }

    filter() {
        if (this.query !== "") {
            /*Contacts.find({displayName: {$regex: ".*" + this.query + ".*"}}).subscribe(contacts => {
             if (this.group) {
             for (let contact of contacts) {
             if (!_.contains(this.group.user, contact.friendId)) {
             this.contactFiltred.push(contact);
             }
             }
             } else {
             this.contactFiltred = contacts;
             }
             });*/
            let contacts = Contacts.collection.find({displayName: {$regex: ".*" + this.query + ".*"}}).map((c) => {
                return c;
            });
            if(contacts){
                if(this.group){
                    this.filterGroup(contacts);
                }else {
                    this.contactFiltred = contacts;
                }
            }
        } else {
            this.contactFiltred = [];
        }

    }
    private filterGroup(contacts : Contact[]){
        for(let contact of contacts){
            if(!_.contains(this.group.user, contact.friendId)){
               if(this.contactFiltred.length > 0){
                   if(!_.contains(this.contactFiltred.map((c)=> {return c.friendId}),contact.friendId)){
                       this.contactFiltred.push(contact);
                   }
               } else {
                   this.contactFiltred.push(contact);
               }
            }
        }
    }

    onPictureUpdate(file: File) {
        if (/image\/.*/g.test(file.type)) {
            if (this.group.picture) {
                Files.remove({_id: this.group.picture});
            }
            Chats.update(this.group._id, {$set: {picture: file._id}});
            this.successMessage = "Picture successfully updated";
            this.errorMessage = "";
        } else {
            Files.remove(file._id);
            this.successMessage = "";
            this.errorMessage = "Error, only image are supported.";
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
                publicly: this.publicly,
                type: ChatType.GROUP,
                title: this.groupTitle,
                ownerId: newOwnerId
            });
            this.router.navigate(["/group/" + chat]);
        } else {
            this.error = true;
        }
    }

    updateGroup() {
        if (this.mySelection.length > 0) {
            let listUserId = this.mySelection.map((u) => {
                return u.friendId
            });
            Chats.update({_id: this.group._id}, {$push: {user: {$each: listUserId}}});
        }
        if (this.groupTitle !== this.group.title) {
            Chats.update({_id: this.group._id}, {$set: {title: this.groupTitle}});
        }
        if (this.publicly !== this.group.publicly) {
            Chats.update({_id: this.group._id}, {$set: {publicly: this.publicly}});
        }
        this.router.navigate(["/group/" + this.groupId]);
    }
}
