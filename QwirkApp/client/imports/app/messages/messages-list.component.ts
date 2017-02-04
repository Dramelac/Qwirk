import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Messages } from '../../../../both/collections/message.collection';
import { Message } from '../../../../both/models/message.model';

import template from './messages-list.component.html';

@Component({
    selector: 'messages-list',
    template
})
export class MessagesListComponent {
    messages: Observable<Message[]>;

    constructor() {
        this.messages = Messages.find({}).zone();
    }

    removeMessage(msg: Message): void {
        Messages.remove(msg._id);
    }
}