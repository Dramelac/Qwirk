import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";

import template from "./verify-mail.component.html";

@Component({
    template
})
export class VerifyMailComponent implements OnInit, OnDestroy {
    token: string;
    paramsSub: Subscription;

    error :string;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.error = "";
        this.paramsSub = this.route.params
            .map(params => params["token"])
            .subscribe(token => {
                this.token = token;
                Accounts.verifyEmail(this.token, (err) => {
                    if (err){
                        this.error = err.reason;
                    }
                })
            });
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}