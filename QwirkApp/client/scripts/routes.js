import { _ } from 'meteor/underscore';
import { Config, Runner } from 'angular-ecmascript/module-helpers';

import loginTemplateUrl from '../templates/login.html';
import profileTemplateUrl from '../templates/profile.html';
import settingsTemplateUrl from '../templates/settings.html';
import signupTemplateUrl from '../templates/signup.html'

class RoutesConfig extends Config {
  constructor() {
    super(...arguments);

    this.isAuthorized = ['$auth', this.isAuthorized.bind(this)];
  }

  configure() {
    this.$stateProvider
      .state('login', {
        url: '/login',
        templateUrl: loginTemplateUrl,
        controller: 'LoginCtrl as logger'
      })
      .state('signup', {
          url: '/signup',
          templateUrl: signupTemplateUrl,
          controller: 'SignupCtrl as signup'
      });

    this.$urlRouterProvider.otherwise('/login');
  }

  isAuthorized($auth) {
    return $auth.awaitUser();
  }
}

RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

class RoutesRunner extends Runner {
  run() {
    this.$rootScope.$on('$stateChangeError', (...args) => {
      const err = _.last(args);

      if (err === 'AUTH_REQUIRED') {
        this.$state.go('login');
      }
    });
  }
}

RoutesRunner.$inject = ['$rootScope', '$state'];

export default [RoutesConfig, RoutesRunner];