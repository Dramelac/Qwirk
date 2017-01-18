// Libs
import 'angular-animate';
import 'angular-meteor';
import 'angular-meteor-auth';
import 'angular-moment';
import 'angular-sanitize';
import 'angular-ui-router';
import 'ionic-scripts';
import Angular from 'angular';
import Loader from 'angular-ecmascript/module-loader';
import { Meteor } from 'meteor/meteor';

// Modules
import LoginCtrl from '../controllers/login.controller';
import ProfileCtrl from '../controllers/profile.controller';
import PasswordForgottenCtrl from '../controllers/passwordforgotten.controller';
import SettingsCtrl from '../controllers/settings.controller';
import SignupCtrl from '../controllers/signup.controller'
import InputDirective from '../directives/input.directive';
import CalendarFilter from '../filters/calendar.filter';
import Routes from '../routes';

const App = 'Qwirk';

// App
Angular.module(App, [
  'angular-meteor',
  'angular-meteor.auth',
  'angularMoment',
  'ionic'
]);

new Loader(App)
  .load(LoginCtrl)
  .load(ProfileCtrl)
  .load(PasswordForgottenCtrl)
  .load(SettingsCtrl)
  .load(SignupCtrl)
  .load(InputDirective)
  .load(CalendarFilter)
  .load(Routes);

// Startup
if (Meteor.isCordova) {
  Angular.element(document).on('deviceready', onReady);
}
else {
  Angular.element(document).ready(onReady);
}

function onReady() {
  Angular.bootstrap(document, [App]);
}
