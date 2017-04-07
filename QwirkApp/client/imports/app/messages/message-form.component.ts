import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Messages } from '../../../../both/collections';

import template from './message-form.component.html';
import {MessageType} from "../../../../both/models/message.model";

@Component({
    selector: 'message-form',
    template
})
export class MessageFormComponent implements OnInit {
    addForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.addForm = this.formBuilder.group({
            content: ['', Validators.required],
            chatId: ['LuMLDdPSvuobXNqNJ', Validators.required]
        });
    }

    addMessage(): void {
        if (!Meteor.userId()){
            alert('Please log in to add a message');
            return;
        }
        if (this.addForm.valid){
            Meteor.call("addMessage", MessageType.TEXT, this.addForm.value.chatId, this.addForm.value.content,
                (error, result) => {

            });
            //Messages.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));

            this.addForm.reset();
        }
    }
}