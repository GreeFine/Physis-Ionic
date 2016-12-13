// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

    // Each tab has its own nav history stack:
      .state('tab.group', {
        url: '/group',
        views: {
          'tab-group': {
            templateUrl: 'templates/tab-group.html',
          }
        }
      })

      .state('tab.track', {
        url: '/track',
        views: {
          'tab-track': {
            templateUrl: 'templates/tab-track.html'
          }
        }
      })

      .state('tab.coach', {
        url: '/coach',
        views: {
          'tab-coach': {
            templateUrl: 'templates/tab-coach.html'
          }
        }
      })

      .state('tab.lesson', {
        url: '/lesson',
        views: {
          'tab-lesson': {
            templateUrl: 'templates/tab-lesson.html'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
          }
        }
      })

      .state('tab.login', {
        url: '/login',
        views: {
          'tab-account': {
            templateUrl: 'templates/acc-login.html',
          }
        }
      })

      .state('tab.register', {
        url: '/register',
        views: {
          'tab-account': {
            templateUrl: 'templates/acc-register.html',
          }
        }
      })

      .state('tab.edit', {
        url: '/account/edit',
        views: {
          'tab-account': {
            templateUrl: 'templates/acc-register.html',
          }
        }
      })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/login');
});
