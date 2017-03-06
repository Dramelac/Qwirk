import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import template from './login.component.html';
import {Status} from "../../../../both/models/status.enum";
import {Profiles} from "../../../../both/collections/profile.collection";

@Component({
    selector: 'login',
    template
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    error: string;

    constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            log: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.error = '';
    }

    login() {
        if (this.loginForm.valid) {
            Meteor.loginWithPassword(this.loginForm.value.log, this.loginForm.value.password, (err) => {
                this.zone.run(() => {
                    if (err) {
                        this.error = err;
                    } else {
                        Profiles.update(Meteor.user().profile.id, {$set: {status: Status.Online}});
                        this.router.navigate(['/']);
                    }
                });
            });
        }
    }
}