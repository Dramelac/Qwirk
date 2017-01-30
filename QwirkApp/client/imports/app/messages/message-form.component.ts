import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Messages } from '../../../../both/collections/message.collection';

import template from './message-form.component.html';

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
            user: ['', Validators.required]
        });
    }

    addMessage(): void {
        if (this.addForm.valid){
            Messages.insert(this.addForm.value);

            this.addForm.reset();
        }
    }
}