import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import template from "./message-form.component.html";
import {MessageType} from "../../../../both/models/message.model";

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
            let msg = this.processMessage(this.addForm.value.content);
            Meteor.call("addMessage", MessageType.TEXT,this.chatId, msg,
                (error, result) => {

            });
            //Messages.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));

            this.addForm.reset();
        }
    }

    processMessage(msg: string): string{
        // italic
        msg = msg.replace(/\/([^/]*)\//g,"<i>$1</i>");
        // bold
        msg = msg.replace(/\*([^*]*)\*/g,"<b>$1</b>");
        // underline
        msg = msg.replace(/_([^_]*)_/g,"<u>$1</u>");
        // strike
        msg = msg.replace(/~([^~]*)~/g,"<del>$1</del>");

        return msg;
    }
}