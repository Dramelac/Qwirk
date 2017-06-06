import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import template from './reset-password.component.html';

@Component({
    selector: 'reset-password',
    template
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    resetForm: FormGroup;
    error: string;
    token: string;
    paramsSub: Subscription;

    constructor(private route: ActivatedRoute, private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

    ngOnInit() {
        this.resetForm = this.formBuilder.group({
            password: ['', Validators.required]
        });

        this.paramsSub = this.route.params
            .map(params => params["token"])
            .subscribe(token => {
            this.token = token;
        });

        this.error = '';
    }

    reset() {
        if (this.resetForm.valid) {
            Accounts.resetPassword(this.token, this.resetForm.value.password,
                (err) => {
                    if (err) {
                        this.zone.run(() => {
                            this.error = err.reason;
                        });
                    } else {
                        this.router.navigate(['/']);
                    }
                });
        }
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}