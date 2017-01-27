import { Controller } from 'angular-ecmascript/module-helpers';
import { ReactiveDict} from 'meteor/reactive-dict'
export default class SignupCtrl extends Controller {
    constructor() {
        super(...arguments);

    }
    register() {
        if (_.isEmpty(this.email) || _.isEmpty(this.phone) || _.isEmpty(this.password)) return;

        $http.post('notre_page_de_traitement', {'email': this.email, 'phone': this.phone, 'password': this.password}).
        success(function(data, status) {
            //Succès
            console.log('succès');
        });
    }
}

SignupCtrl.$name = 'SignupCtrl';