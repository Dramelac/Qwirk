import {Component, OnInit} from "@angular/core";
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
export class AppComponent implements OnInit {
    constructor(private router: Router) {
    }

    ngOnInit(): void {
        if (!("Notification" in window)) {
            console.log("Ce navigateur ne supporte pas les notifications desktop");
        } else {
            Notification.requestPermission(function (permission) {
                // Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
            });
        }

    }

    logout() {
        Profiles.update(Meteor.user().profile.id, {$set: {status: Status.Offline}});
        Meteor.logout();
        this.router.navigate(['/']);
    }
}
