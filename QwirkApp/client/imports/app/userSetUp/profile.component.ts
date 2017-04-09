import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./profile.component.html";
import {Profile} from "../../../../both/models/profile.model";
import {Profiles} from "../../../../both/collections/profile.collection";
import {MeteorObservable} from "meteor-rxjs";
import {Subscription} from "rxjs";

@Component({
    selector: 'profile',
    template
})

export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    error: string;
    currentUser = Meteor.user();
    profile: Profile;
    profileSub: Subscription;

    constructor(private formBuilder: FormBuilder) {
    }


    ngOnInit() {

        if (this.profileSub){
            this.profileSub.unsubscribe();
        }

        MeteorObservable.subscribe('profiles', this.currentUser._id).subscribe();
        //TODO fix this
        this.profile = Profiles.findOne({userId:this.currentUser._id});

        this.profileForm = this.formBuilder.group({
            username: [this.profile.username, Validators.required],
            picture: [this.profile.picture, Validators.required],
            email: [this.currentUser.emails[0].address, Validators.required],
            newPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });


        this.error = '';
    }

    save() {

    }


}