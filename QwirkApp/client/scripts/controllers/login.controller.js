import { _ } from 'meteor/underscore';
import { Controller } from 'angular-ecmascript/module-helpers';

export default class LoginCtrl extends Controller {
  login() {
    if (_.isEmpty(this.username) || _.isEmpty(this.password)) return;
    //Envoyer les données au serveur
      console.log("LOGIN user: "+this.username + "PW: "+ this.password);
      const salt = "§fg)ù=)à)=$***)àç_è(-è_ç*ù$*!ù$=)àç_è-é;";

  }
}

LoginCtrl.$name = 'LoginCtrl';
LoginCtrl.$inject = ['$state', '$ionicLoading', '$ionicPopup', '$log'];
