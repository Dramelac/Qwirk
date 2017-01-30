import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import { Messages } from "../../../both/collections/message.collection"
import { Message } from "../../../both/models/message.model"

import template from "./app.component.html";
import style from "./app.component.scss";

@Component({
  selector: "app",
  template,
  styles: [ style ]
})
export class AppComponent {
    messages: Observable<Message[]>;

    constructor() {
        this.messages = Messages.find({}).zone();
    }

    removeMessage(message: Message): void {
        Messages.remove(message._id);
    }
}
