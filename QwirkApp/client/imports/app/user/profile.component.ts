import {Component, NgZone, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import style from "./profile.component.scss";
import template from "./profile.component.html";
import {Contact, File, Profile} from "../../../../both/models";
import {Contacts, Files, Profiles} from "../../../../both/collections";
import {InjectUser} from "angular2-meteor-accounts-ui";
import {ActivatedRoute} from "@angular/router";
import {MeteorObservable} from "meteor-rxjs";
import {FriendsRequest} from "../../../../both/collections/friend-request.collection";

@Component({
    selector: 'profile',
    template,
    styles: [style]
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
    friendProfile: boolean = false;
    isContact: boolean = false;

    pictureId: string;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private zone: NgZone) {
    }


    ngOnInit() {
        this.route.params.map(params => params["profileID"]).subscribe(profile => {
            if (profile) {
                this.profileId = profile;
                MeteorObservable.subscribe('myContacts').subscribe(() => {
                    MeteorObservable.autorun().subscribe(() => {
                        this.contact = Contacts.findOne({$and: [{ownerId: Meteor.userId()}, {profileId: this.profileId}]});
                        if (this.contact){
                            //console.log(this.contact);
                            this.profileForm = this.formBuilder.group({
                                username: [this.contact.displayName, Validators.required]
                            });
                            this.profile = {username: this.contact.displayName};
                            this.myProfile = false;
                            this.isContact = true;
                            MeteorObservable.subscribe('profileContact', this.contact.profileId).subscribe(() => {
                                MeteorObservable.autorun().subscribe(() => {
                                    this.zone.run(()=>{
                                        this.profile = Profiles.findOne({_id:this.contact.profileId});
                                        if (this.profile){
                                            this.loadPicture();
                                            this.profile.username = this.contact.displayName;
                                            this.friendProfile = true;
                                        } else {
                                            this.profile = {username: this.contact.displayName};
                                        }
                                    });
                                });
                            });
                        } else {
                            MeteorObservable.subscribe('profileId', this.profileId).subscribe(() => {
                                MeteorObservable.autorun().subscribe(() => {
                                    this.zone.run(()=>{
                                        this.profile = Profiles.findOne({_id:this.profileId});
                                        if (this.profile){
                                            this.loadPicture();
                                            this.myProfile = false;
                                            this.friendProfile = true;
                                        }
                                    });
                                });
                            });
                        }
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
                                birthday: [this.profile.birthday],
                                biography: [this.profile.biography],
                                email: [Meteor.user().emails[0].address, Validators.required],
                                newPassword: [''],
                                confirmPassword: [''],
                                oldPassword: ['']
                            });

                            this.loadPicture();
                        }
                    })
                });
            }
        });
        this.error = '';
        this.success = '';
    }

    loadPicture(){
        MeteorObservable.subscribe("file", this.profile.picture).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
                this.pictureId = this.profile.picture;
            });
        });
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
            let profil: Profile = {
                firstname: formValue.firstname,
                lastname: formValue.lastname,
                username: formValue.username,
                biography: formValue.biography,
                birthday: formValue.birthday
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

    addContact(): void {
        Meteor.call("addFriendRequest", this.profile.userId, (error, result) => {
        });
    }

    requestSent(): boolean {
        return !!FriendsRequest.collection.find({
                $and: [
                    {initiator: Meteor.userId()},
                    {destinator: this.profile.userId}
                ]
            }).count() || !!Contacts.collection.find({$and: [{ownerId: Meteor.userId()}, {friendId: this.profile.userId}]}).count();
    }

}