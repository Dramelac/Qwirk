import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./message-form.component.html";
import {Chat, File, MessageType} from "../../../../both/models";

@Component({
    selector: 'message-form',
    template
})
export class MessageFormComponent implements OnInit {
    addForm: FormGroup;
    @Input('chat') chat: Chat;

    constructor(
        private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.addForm = this.formBuilder.group({
            content: ['', Validators.required]
        });
        console.log("Init message form, isAdmin:", this.chat.isAdmin, "chat type:", this.chat.type);
    }

    addMessage(): void {
        if (!Meteor.userId()){
            alert('Please log in to add a message');
            return;
        }
        if (this.chat.isAdmin && this.chat.type === "Group"){
            if (this.checkGroupCommand()){
                return;
            }
        }
        if (this.addForm.valid){
            Meteor.call("addMessage", MessageType.TEXT,this.chat._id, this.addForm.value.content,
                (error, result) => {
                    if (error){
                        console.error("Error:", error);
                    }
            });
            //Messages.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));

            this.addForm.reset();
        }
    }

    checkGroupCommand():boolean{
        let input = this.addForm.value.content;



        return false;
    }

    onFileUploaded(file: File){
        let type = /image\/.*/g.test(file.type) ? MessageType.PICTURE : MessageType.FILE;
        Meteor.call("addMessage", type, this.chat._id, file._id,
            (error, result) => {
                if (error){
                    console.error("Error:", error);
                }
            });
    }

    sendWizz(){
        Meteor.call("addMessage", MessageType.WIZZ, this.chat._id, "wizz",
            (error, result) => {
                if (error){
                    console.error("Error:", error);
                }
            });
    }

}