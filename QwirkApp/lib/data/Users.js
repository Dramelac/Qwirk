/**
 * Created by droopy on 1/25/17.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Users = new Mongo.Collection('user');

Meteor.methods({
    'users.insert'(username, password, mail, phoneNumber){
        check(username, String);
        check(password, String);
        check(mail, String);
        check(phoneNUmbre, int);


        Users.insert({
            username,
            password,
            mail,
            phoneNumber,
            profile: Meteor.call('profiles.insert', this._id),
        });
    },
    'users.getPasswordFromLogin'(login){
        check(login,String);
        var user =Users.findOne({mail : login});
        return user.password.value;
    }
});