import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./message-form.component.html";
import {MessageType} from "../../../../both/models/message.model";
import {File} from "../../../../both/models";

@Component({
    selector: 'message-form',
    template
})
export class MessageFormComponent implements OnInit {
    addForm: FormGroup;
    @Input('chatId') chatId: string;

    constructor(
        private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.addForm = this.formBuilder.group({
            content: ['', Validators.required]
        });
    }

    addMessage(): void {
        if (!Meteor.userId()){
            alert('Please log in to add a message');
            return;
        }
        if (this.addForm.valid){
            Meteor.call("addMessage", MessageType.TEXT,this.chatId, this.addForm.value.content,
                (error, result) => {
                    if (error){
                        console.error("Error:", error);
                    }
            });
            //Messages.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));

            this.addForm.reset();
        }
    }

    onFileUploaded(file: File){
        let type = /image\/.*/g.test(file.type) ? MessageType.PICTURE : MessageType.FILE;
        Meteor.call("addMessage", type, this.chatId, file._id,
            (error, result) => {
                if (error){
                    console.error("Error:", error);
                }
            });
    }

    sendWizz(){
        Meteor.call("addMessage", MessageType.WIZZ, this.chatId, "wizz",
            (error, result) => {
                if (error){
                    console.error("Error:", error);
                }
            });
    }

}