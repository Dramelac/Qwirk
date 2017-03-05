import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import template from './profile.component.html';

@Component({
    selector: 'profile',
    template
})

export class ProfileComponent implements OnInit{
    profileForm: FormGroup;
    error: string;
    currentUser = Meteor.user();

    constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}


    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            username: [this.currentUser.username,Validators.required],
            email: [this.currentUser.emails[0].address,Validators.required],
            newPassword:['',Validators.required],
            confirmPassword:['',Validators.required]
        });

        this.error = '';
    }

    profile(){

    }


}