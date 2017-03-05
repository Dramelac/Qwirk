import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Profiles } from '../../../../both/collections/profile.collection';

import template from './signup.component.html';
import {Profile} from "../../../../both/models/profile.model";
import {Status} from "../../../../both/models/status.enum";

@Component({
    selector: 'signup',
    template
})
export class SignupComponent implements OnInit {
    signupForm: FormGroup;
    error: string;

    constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            email: ['', Validators.required],
            username:['',Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['',Validators.required],
            firstname: [''],
            lastname:[''],
            birthday:['']
        });

        this.error = '';
    }

    signup() {
        let formValue = this.signupForm.value;
        if (this.signupForm.valid && formValue.confirmPassword == formValue.password) {
            Accounts.createUser({
                email: this.signupForm.value.email,
                password: this.signupForm.value.password,
                username: this.signupForm.value.username
            }, (err) => {
                if (err) {
                    this.zone.run(() => {
                        this.error = err;
                    });
                } else {
                    Profiles.insert({
                        userId: Meteor.userId(),
                        status: Status.Online,
                        firstname: this.signupForm.value.firstname,
                        lastname: this.signupForm.value.lastname,
                        birthday: this.signupForm.value.birthday,
                        contacts: []
                    });
                    this.router.navigate(['/']);
                }
            });
        }else{
            this.error = "Formulaire incorrecte vérifier que votre mot de passe corresponde à celui de confirmation";
        }
    }
}