import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import template from "./add-group.component.html";
import {Contact} from "../../../../both/models/contact.model";
import {Contacts} from "../../../../both/collections/contact.collection";
import {MeteorObservable} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import * as _ from "underscore";
import {Chats} from "../../../../both/collections/chat.collection";
import {ChatType} from "../../../../both/models/chat.model";
import {Router} from "@angular/router";
import {ContextMenuComponent} from "angular2-contextmenu";

@Component({
    selector: 'add-group',
    template
})

export class AddGroupComponent implements OnInit, OnDestroy {

    groupTitle: string = null;
    query : string = null;
    contactsSub: Subscription;
    contactFiltred: Contact[] = [];
    mySelection : Contact[] = [];
    selected: string[];

    @ViewChild(ContextMenuComponent) public groupMenu: ContextMenuComponent;
    constructor(private router: Router) {

    }

    ngOnInit(): void {
        this.contactsSub = MeteorObservable.subscribe('myContacts').subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
            });
        });
    }

    ngOnDestroy(): void {
        if(this.contactsSub){
            this.contactsSub.unsubscribe();
        }
    }

    filter() {
        if (this.query !== ""){
           Contacts.find({displayName: {$regex: ".*" + this.query + ".*"}}).subscribe( contact => {
                this.contactFiltred = contact;
            });

        }else{
            this.contactFiltred = [];
        }
    }

    select(contact:Contact){
        if(!_.contains(this.mySelection.map((u)=>{return u._id}), contact._id)){
            this.mySelection.push(contact);
            this.query ='';
            this.contactFiltred = [];
        }
    }

    remove(contact : Contact){
        let index = this.mySelection.indexOf(contact);
        if(index > -1 ){
            this.mySelection.splice(index,1);
            console.log("index : ",this.mySelection.indexOf(contact));
            console.log("taille liste : ",this.mySelection.length)
        }
    }

    addGroup(){
        let listUserId = this.mySelection.map((u)=>{return u.friendId});
        listUserId.push(Meteor.userId());
        let adminList = [];
        adminList.push(Meteor.userId());

        if(!this.groupTitle){
            this.mySelection.map((u) => {
                if(this.groupTitle){
                    this.groupTitle = this.groupTitle + ", " + u.displayName;
                }else{
                    this.groupTitle = u.displayName;
                }
            });
        }

        let chat = Chats.collection.insert({user : listUserId, admin : adminList, publicly : false, type : ChatType.GROUP, title : this.groupTitle});
        this.router.navigate(["/group/" + chat]);
    }
}
