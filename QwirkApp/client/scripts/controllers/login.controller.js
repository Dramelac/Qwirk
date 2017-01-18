import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Controller } from 'angular-ecmascript/module-helpers';

export default class LoginCtrl extends Controller {
  login() {
    if (_.isEmpty(this.username) || _.isEmpty(this.password)) return;
    //Envoyer les données au serveur
      $http.post('notre_page', {'username': this.username, 'password': this.password}).
      success(function(data, status) {
          //Succès
          console.log('succès');
      });

  }
}

LoginCtrl.$name = 'LoginCtrl';
LoginCtrl.$inject = ['$state', '$ionicLoading', '$ionicPopup', '$log'];
