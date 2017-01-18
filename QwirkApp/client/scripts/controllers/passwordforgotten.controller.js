/**
 * Created by Kassem on 18/01/2017.
 */
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Controller } from 'angular-ecmascript/module-helpers';

export default class LoginCtrl extends Controller {
    reninitpass() {
        if (_.isEmpty(this.email)) return;
        //Envoyer les données au serveur
        $http.post('notre_page', {'email': this.email}).
        success(function(data, status) {
            //Succès
            console.log('succès');
        });
    }
}

LoginCtrl.$name = 'PasswordForgottenCtrl';
LoginCtrl.$inject = ['$state', '$ionicLoading', '$ionicPopup', '$log'];