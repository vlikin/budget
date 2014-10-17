var app = angular.module('appModule')

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/user/login', {
        templateUrl: '/static/app/partials/user-login.html',
        controller: 'User-loginController'
      }).
      when('/phones', {
        templateUrl: '/static/app/partials/phone-list.html',
        controller: 'Phone-ListCtrl'
      }).
      when('/phones/:phoneId', {
        templateUrl: '/static/app/partials/phone-detail.html',
        controller: 'Phone-DetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }
])
// http://stackoverflow.com/questions/20969835/angularjs-login-and-authentication-in-each-route-and-controller
.run(function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event) {

        if (!AuthService.isAuthenticated()) {
            console.log('DENY');
            event.preventDefault();
            $location.path('#/login');
        }
        else {
            console.log('ALLOW');
            $location.path('#/home');
        }
    });
});