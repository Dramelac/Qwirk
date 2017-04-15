import {Component} from "@angular/core";

import template from "./app.component.html";
import style from "./app.component.scss";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {Status} from "../../../both/models/status.enum";
import {Profiles} from "../../../both/collections";
import {Router} from "@angular/router";

@Component({
    selector: "app",
    template,
    styles: [style]
})
@InjectUser('user')
export class AppComponent {
    constructor(private router: Router) {

    }

    logout() {
        Profiles.update(Meteor.user().profile.id, {$set: {status: Status.Offline}});
        Meteor.logout();
        this.router.navigate(['/']);
    }
}
