import {Controller} from 'angular-ecmascript/module-helpers';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Accounts} from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
export default class RegisterCtrl extends Controller {
    constructor() {
        super(...arguments);

    }

    register() {
        if (_.isEmpty(this.username) || _.isEmpty(this.email) || _.isEmpty(this.password)) return;

        Accounts.createUser({
            username : this.username,
            email : this.email,
            password : this.password
        });
        var newuser = Meteor.user();
        console.log('success' + newuser.password)
    }
}

RegisterCtrl.$name = 'RegisterCtrl';