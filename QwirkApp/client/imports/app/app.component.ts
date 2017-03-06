import {Component} from "@angular/core";

import template from "./app.component.html";
import style from "./app.component.scss";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Status} from "../../../both/models/status.enum";

@Component({
    selector: "app",
    template,
    styles: [style]
})
@InjectUser('user')
export class AppComponent {
    constructor() {

    }

    logout() {
        Meteor.users.update(Meteor.userId(), {$set: {"profile.status": Status.Offline}});
        Meteor.logout();
    }
}
