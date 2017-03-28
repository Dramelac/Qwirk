import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Profiles } from '../../../../both/collections';

import template from './signup.component.html';
import {Status} from "../../../../both/models/status.enum";
import {Profile} from "../../../../both/models/profile.model";

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
            let profil: Profile = {
                userId: "",
                status: Status.Online,
                firstname: this.signupForm.value.firstname,
                lastname: this.signupForm.value.lastname,
                birthday: this.signupForm.value.birthday,
                contacts: [],
                username: this.signupForm.value.username
            };
            Profiles.insert(profil);
            let profilId = Profiles.findOne({username: profil.username})._id;
            Accounts.createUser({
                email: this.signupForm.value.email,
                password: this.signupForm.value.password,
                username: this.signupForm.value.username,
                profile: {
                    id: profilId
                }
            }, (err) => {
                if (err) {
                    Profiles.remove(profilId);
                    this.zone.run(() => {
                        this.error = err;
                    });
                } else {
                    Profiles.update(profilId, {$set: {userId: Meteor.userId()}});
                    this.router.navigate(['/']);
                }
            });
        }else{
            this.error = "Formulaire incorrecte vérifier que votre mot de passe corresponde à celui de confirmation";
        }
    }
}