var app = angular.module('appModule')

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/user/login', {
        templateUrl: '/static/app/partials/user-login.html',
        controller: 'User-loginController',
        requires_anonym: true
      }).
      when('/user/signup', {
        templateUrl: '/static/app/partials/user-signup.html',
        controller: 'User-SignupController',
        requires_anonym: true
      }).
      when('/user/profile/view', {
        templateUrl: '/static/app/partials/user-profile-view.html',
        controller: 'User-ProfileViewController',
        requires_auth: true
      }).
      when('/user/profile/edit', {
        templateUrl: '/static/app/partials/user-profile-edit.html',
        controller: 'User-ProfileEditController',
        requires_auth: true
      }).
      when('/phones', {
        templateUrl: '/static/app/partials/phone-list.html',
        controller: 'Phone-ListCtrl',
        requires_auth: true
      }).
      when('/phones/:phoneId', {
        templateUrl: '/static/app/partials/phone-detail.html',
        controller: 'Phone-DetailCtrl',
        requires_auth: true
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }
])

.run(function ($rootScope, $location, AuthService) {
  $rootScope.$on('$routeChangeStart', function (event, currRoute, prevRoute) {

    // It requires login.
    if ('requires_auth' in currRoute && currRoute.requires_auth && !AuthService.isAuthenticated()) {
      event.preventDefault();
      $location.path('/user/login');
    }

    // It requires anonym.
    if ('requires_anonym' in currRoute && currRoute.requires_anonym && AuthService.isAuthenticated()) {
      event.preventDefault();
      $location.path('/');
    }
  });
});