import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./profile.component.html";
import {Profile} from "../../../../both/models/profile.model";
import {Profiles} from "../../../../both/collections/profile.collection";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {ActivatedRoute, Router} from "@angular/router";
import {Contacts} from "../../../../both/collections/contact.collection";

@Component({
    selector: 'profile',
    template
})
@InjectUser('user')
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    profileId : string;
    error: string;
    profile: Profile;
    myProfile: boolean = true;
    constructor(private route: ActivatedRoute, private router: Router,private formBuilder: FormBuilder) {
    }


    ngOnInit() {
        this.route.params.map(params => params["profileID"]).subscribe(profile => {
            if(profile){
                this.profileId = profile;
                this.profile = Profiles.findOne({_id: this.profileId});
                this.profileForm = this.formBuilder.group({
                    username: [this.profile.username, Validators.required]
                });
                this.myProfile = false;
            } else{

                // This is working because client is already sub to his profile in user-status
                this.profile = Profiles.findOne({userId: Meteor.userId()});

                this.profileForm = this.formBuilder.group({
                    username: [this.profile.username, Validators.required],
                    picture: [this.profile.picture],
                    firstname: [this.profile.firstname],
                    lastname: [this.profile.lastname],
                    email: [Meteor.user().emails[0].address, Validators.required],
                    newPassword: [''],
                    confirmPassword: [''],
                    oldPassword: ['']
                });
            }

        });

        this.error = '';
    }

    save() {
        this.error = '';
        let formValue = this.profileForm.value;
        if(this.profileForm.valid && !this.myProfile){
            let username = formValue.username;
            Contacts.update({ownerId: Meteor.userId()},{$set : {displayName : username}});
        }
        if (this.profileForm.valid && formValue.confirmPassword == formValue.newPassword && formValue.oldPassword != "") {
            Accounts.changePassword(formValue.oldPassword, formValue.newPassword, (err) => {
                if (err){
                    this.error = err.reason;
                }
            });
        }
        if (this.profileForm.valid){
            let profil = {
                firstname: formValue.firstname,
                lastname: formValue.lastname,
                username: formValue.username,
                picture: formValue.picture,
            };
            Profiles.update(this.profile._id, {$set: profil});
            if (formValue.email != Meteor.user().emails[0].address) {
                Meteor.call("updateEmail", formValue.email, Meteor.user().emails[0].address,
                    (error, result) => {
                        if (error){
                            console.error(error);
                        }
                        if (result){
                            console.log(result);
                        }
                    });
            }
        }
        //TODO add success message box
    }


}