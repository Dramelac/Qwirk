import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import template from './profile.component.html';
import User = Meteor.User;

@Component({
    selector: 'profile',
    template
})

export class ProfileComponent implements OnInit{
    profileForm: FormGroup;
    error: string;
    currentUser: User;

    constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}


    ngOnInit() {
        this.profileForm = this.formBuilder.group({
            username: ['',this.currentUser.username],
            email: [this.currentUser.emails],
            newPassword:[''],
            confirmPassword:['']
        });

        this.error = '';
    }

    profile(){

    }


}