import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import template from "./profile.component.html";
import {Contact, File, Profile} from "../../../../both/models";
import {Contacts, Files, Profiles} from "../../../../both/collections";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {ActivatedRoute, Router} from "@angular/router";
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'profile',
    template
})
@InjectUser('user')
export class ProfileComponent implements OnInit {

    profileForm: FormGroup;
    profileId: string;
    contact: Contact;
    error: string;
    success: string;
    profile: Profile;
    myProfile: boolean = true;

    pictureId: string;

    constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) {
    }


    ngOnInit() {
        this.route.params.map(params => params["profileID"]).subscribe(profile => {
            if (profile) {
                this.profileId = profile;
                //TODO add contact sub (like bellow)
                MeteorObservable.subscribe('myContacts').subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        this.contact = Contacts.findOne({$and: [{ownerId: Meteor.userId()}, {profileId: this.profileId}]});
                        console.log(this.contact);
                        this.profileForm = this.formBuilder.group({
                            username: [this.contact.displayName, Validators.required]
                        });
                        this.myProfile = false;
                    });
                });
            } else {
                this.pictureId = "";
                // This is working because client is already sub to his profile in user-status
                MeteorObservable.subscribe('profile').subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        this.profile = Profiles.findOne({userId: Meteor.userId()});
                        if (this.profile) {
                            this.profileForm = this.formBuilder.group({
                                username: [this.profile.username, Validators.required],
                                firstname: [this.profile.firstname],
                                lastname: [this.profile.lastname],
                                email: [Meteor.user().emails[0].address, Validators.required],
                                newPassword: [''],
                                confirmPassword: [''],
                                oldPassword: ['']
                            });

                            MeteorObservable.subscribe("file", this.profile.picture).subscribe(() => {
                                MeteorObservable.autorun().subscribe(() => {
                                    this.pictureId = this.profile.picture;
                                });
                            });
                        }
                    })
                });
            }
        });
        this.error = '';
        this.success = '';
    }

    onPictureUpdate(file: File) {
        if (/image\/.*/g.test(file.type)) {
            if (this.profile.picture) {
                Files.remove({_id: this.profile.picture});
            }
            Profiles.update(this.profile._id, {$set: {picture: file._id}});
            this.success = "Picture successfully updated";
            this.error = "";
        } else {
            Files.remove(file._id);
            this.success = "";
            this.error = "Error, only image are supported.";
        }
    }

    save() {
        this.error = '';
        this.success = '';
        let formValue = this.profileForm.value;
        if (!this.myProfile && this.profileForm.valid) {
            let username = formValue.username;
            Contacts.update({_id: this.contact._id}, {$set: {displayName: username}});
        }
        if (this.myProfile && this.profileForm.valid && formValue.confirmPassword == formValue.newPassword && formValue.oldPassword != "") {
            Accounts.changePassword(formValue.oldPassword, formValue.newPassword, (err) => {
                if (err) {
                    this.error = err.reason;
                    this.success = "";
                }
            });
        }
        if (this.myProfile && this.profileForm.valid) {
            let profil = {
                firstname: formValue.firstname,
                lastname: formValue.lastname,
                username: formValue.username
            };
            Profiles.update(this.profile._id, {$set: profil});
            if (formValue.email != Meteor.user().emails[0].address) {
                Meteor.call("updateEmail", formValue.email, Meteor.user().emails[0].address,
                    (error, result) => {
                        if (error) {
                            //console.error(error);
                            this.error = error.reason;
                            this.success = "";
                        }
                        if (result) {
                            console.log(result);
                        }
                    });
            }
            if (this.error === "") {
                this.success = "Change saved !";
            }
        }
    }

}