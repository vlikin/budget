'use strict';

var app = angular.module('appModule', [
  'LocalStorageModule',
  'ngRoute',
  'MessageCenter',
  'angular-loading-bar',
  'ngAnimate'
])

.run(["AuthService", function(AuthService) { 
  AuthService.get_current_user();
}])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = true;
}]);

var app = angular.module('appModule')
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})
.constant('SETTINGS', {
  user: {
    success_authentication_redirection: '/'
  }
});
angular.module('appModule')

.controller('User-loginController', ["$scope", "$rootScope", "$location", "AUTH_EVENTS", "AuthService", "Lib", "SETTINGS", function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService, Lib, SETTINGS) {
  $scope.credentials = {
    username: 'user 1',
    password: 'user 1'
  };

  $scope.login = function (credentials) {
    AuthService.login(credentials).then(function (data) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      if (data.success) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $location.path(SETTINGS.user.success_authentication_redirection);
        Lib.ShowMessage(data.message, 'success');
      }
      else {
        Lib.ShowMessage(data.message, 'warning');
      }
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };
}])

.controller('User-SignupController', ["$scope", "$rootScope", "$location", "AUTH_EVENTS", "AuthService", "Lib", function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService, Lib) {
  $scope.profile = {};

  $scope.reset = function() {
    $scope.profile = {};
  };
  $scope.register = function() {
  };
}])

.controller('Phone-ListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('/static/app/phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }])

.controller('defaultMenuController', ["$scope", "$location", "AuthService", "Session", function ($scope, $location, AuthService, Session) {
  $scope.session = Session;
  
  $scope.logout = function() {
    AuthService.logout();
    //$location.path('/');
  };
}])

.controller('Phone-DetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);


var app = angular.module('appModule')

.factory('AuthService', ["$http", "Session", "USER_ROLES", function ($http, Session, USER_ROLES) {
  var authService = {};

  authService.get_current_user = function() {
    $http
      .get('/user/rest/current')
      .then(function (res) {
        Session.create('SESSID', res.data.id, USER_ROLES.admin);
      });
  };

  authService.login = function (credentials) {
    return $http
      .post('/user/rest/login', credentials)
      .then(function (res) {
        if (res.data.success) {
          Session.create(res.data.id, res.data.user.id, USER_ROLES.admin);
          return res.data;
        }

        return res.data;
      });
  };

  authService.logout = function (credentials) {
    $http
      .get('/user/rest/logout')
      .then(function (res) {
        if (res.data.success) {
          Session.destroy();
        }
      });
  };

  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
}]);
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

.run(["$rootScope", "$location", "AuthService", function ($rootScope, $location, AuthService) {
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
}]);
angular.module('appModule')

.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
    this.isAuthenticated = !!userId;
  };

  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
    this.isAuthenticated = false;
  };

  return this;
})

.service('Lib', ["MessageService", function (MessageService) {
  this.ShowMessage = function(message, type, important) {
    type = type | 'info';
    important = important | true;
    MessageService.broadcast(message, {color: type, important: important, classes: 'alert alert-error'});
  };

  return this;
}]);
angular.module('appModule')

.directive('emailValidator', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
         $http
           .post('/user/rest/email_exists', {email: viewValue})
           .then(function(res) {
             if (!res.data.success) {
               ctrl.$setValidity('email', false);
             }
             else {
               ctrl.$setValidity('email', true);
             }
           });
      });
    }
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiLCJ2YWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSxnQkFBQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7RUFDQTtBQUNBOztBQ2ZBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7SUFDQTtFQUNBO0FBQ0E7QUNuQkE7O0FBRUEsYUFBQSxvQkFBQSxHQUFBLHVGQUFBO0VBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7TUFDQTtJQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBOztBQUVBLGFBQUEscUJBQUEsR0FBQSwyRUFBQTtFQUNBOztFQUVBO0lBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBO0VBQ0E7SUFDQTtNQUNBO0lBQ0E7O0lBRUE7RUFDQTs7QUFFQSxhQUFBLHFCQUFBLEdBQUEsa0RBQUE7RUFDQTs7RUFFQTtJQUNBO0lBQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGdCQUFBO0VBQ0E7SUFDQTtFQUNBOzs7QUN4REE7O0FBRUEsVUFBQSxXQUFBLEdBQUEsbUNBQUE7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7VUFDQTtRQUNBOztRQUVBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7UUFDQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtFQUNBOztFQUVBO0lBQ0E7TUFDQTtJQUNBO0lBQ0E7TUFDQTtFQUNBOztFQUVBO0FBQ0EsQ0FBQSxDQUFBO0FDakRBOztBQUVBO0VBQ0E7SUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLG9CQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLHFCQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLGNBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBLGFBQUEsZ0JBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0VBQ0E7QUFDQTs7QUFFQSxLQUFBLDJDQUFBO0VBQ0E7O0lBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTs7SUFFQTtJQUNBO01BQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7QUM5Q0E7O0FBRUEsVUFBQSxPQUFBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtFQUNBOztFQUVBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtBQUNBOztBQUVBLFVBQUEsR0FBQSxHQUFBLG1CQUFBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtBQUNBLENBQUEsQ0FBQTtBQzVCQTs7QUFFQSxZQUFBLGNBQUE7RUFDQTtJQUNBO0lBQ0E7TUFDQTtTQUNBO1dBQ0E7V0FDQTthQUNBO2VBQ0E7YUFDQTthQUNBO2VBQ0E7YUFDQTtXQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScsIFtcbiAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICduZ1JvdXRlJyxcbiAgJ01lc3NhZ2VDZW50ZXInLFxuICAnYW5ndWxhci1sb2FkaW5nLWJhcicsXG4gICduZ0FuaW1hdGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7IFxuICBBdXRoU2VydmljZS5nZXRfY3VycmVudF91c2VyKCk7XG59KVxuLmNvbmZpZyhbJ2NmcExvYWRpbmdCYXJQcm92aWRlcicsIGZ1bmN0aW9uKGNmcExvYWRpbmdCYXJQcm92aWRlcikge1xuICBjZnBMb2FkaW5nQmFyUHJvdmlkZXIuaW5jbHVkZVNwaW5uZXIgPSB0cnVlO1xufV0pO1xuIiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG59KVxuLmNvbnN0YW50KCdVU0VSX1JPTEVTJywge1xuICBhbGw6ICcqJyxcbiAgYWRtaW46ICdhZG1pbicsXG4gIGVkaXRvcjogJ2VkaXRvcicsXG4gIGd1ZXN0OiAnZ3Vlc3QnXG59KVxuLmNvbnN0YW50KCdTRVRUSU5HUycsIHtcbiAgdXNlcjoge1xuICAgIHN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb246ICcvJ1xuICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmNvbnRyb2xsZXIoJ1VzZXItbG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBVVRIX0VWRU5UUywgQXV0aFNlcnZpY2UsIExpYiwgU0VUVElOR1MpIHtcbiAgJHNjb3BlLmNyZWRlbnRpYWxzID0ge1xuICAgIHVzZXJuYW1lOiAndXNlciAxJyxcbiAgICBwYXNzd29yZDogJ3VzZXIgMSdcbiAgfTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICBBdXRoU2VydmljZS5sb2dpbihjcmVkZW50aWFscykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAkbG9jYXRpb24ucGF0aChTRVRUSU5HUy51c2VyLnN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb24pO1xuICAgICAgICBMaWIuU2hvd01lc3NhZ2UoZGF0YS5tZXNzYWdlLCAnc3VjY2VzcycpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIExpYi5TaG93TWVzc2FnZShkYXRhLm1lc3NhZ2UsICd3YXJuaW5nJyk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luRmFpbGVkKTtcbiAgICB9KTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdVc2VyLVNpZ251cENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEFVVEhfRVZFTlRTLCBBdXRoU2VydmljZSwgTGliKSB7XG4gICRzY29wZS5wcm9maWxlID0ge307XG5cbiAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcbiAgfTtcbiAgJHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24oKSB7XG4gIH07XG59KVxuXG4uY29udHJvbGxlcignUGhvbmUtTGlzdEN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsXG4gIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwKSB7XG4gICAgJGh0dHAuZ2V0KCcvc3RhdGljL2FwcC9waG9uZXMvcGhvbmVzLmpzb24nKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5waG9uZXMgPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLm9yZGVyUHJvcCA9ICdhZ2UnO1xuICB9XSlcblxuLmNvbnRyb2xsZXIoJ2RlZmF1bHRNZW51Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRsb2NhdGlvbiwgQXV0aFNlcnZpY2UsIFNlc3Npb24pIHtcbiAgJHNjb3BlLnNlc3Npb24gPSBTZXNzaW9uO1xuICBcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpO1xuICAgIC8vJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdQaG9uZS1EZXRhaWxDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJyxcbiAgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcbiAgICAkc2NvcGUucGhvbmVJZCA9ICRyb3V0ZVBhcmFtcy5waG9uZUlkO1xuICB9XSk7XG5cbiIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmZhY3RvcnkoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCBVU0VSX1JPTEVTKSB7XG4gIHZhciBhdXRoU2VydmljZSA9IHt9O1xuXG4gIGF1dGhTZXJ2aWNlLmdldF9jdXJyZW50X3VzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cFxuICAgICAgLmdldCgnL3VzZXIvcmVzdC9jdXJyZW50JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgU2Vzc2lvbi5jcmVhdGUoJ1NFU1NJRCcsIHJlcy5kYXRhLmlkLCBVU0VSX1JPTEVTLmFkbWluKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGF1dGhTZXJ2aWNlLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgcmV0dXJuICRodHRwXG4gICAgICAucG9zdCgnL3VzZXIvcmVzdC9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgIFNlc3Npb24uY3JlYXRlKHJlcy5kYXRhLmlkLCByZXMuZGF0YS51c2VyLmlkLCBVU0VSX1JPTEVTLmFkbWluKTtcbiAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5sb2dvdXQgPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAkaHR0cFxuICAgICAgLmdldCgnL3VzZXIvcmVzdC9sb2dvdXQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhU2Vzc2lvbi51c2VySWQ7XG4gIH07XG4gXG4gIGF1dGhTZXJ2aWNlLmlzQXV0aG9yaXplZCA9IGZ1bmN0aW9uIChhdXRob3JpemVkUm9sZXMpIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShhdXRob3JpemVkUm9sZXMpKSB7XG4gICAgICBhdXRob3JpemVkUm9sZXMgPSBbYXV0aG9yaXplZFJvbGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIChhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSAmJlxuICAgICAgYXV0aG9yaXplZFJvbGVzLmluZGV4T2YoU2Vzc2lvbi51c2VyUm9sZSkgIT09IC0xKTtcbiAgfTtcbiBcbiAgcmV0dXJuIGF1dGhTZXJ2aWNlO1xufSk7IiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLFxuICBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyLlxuICAgICAgd2hlbignL3VzZXIvbG9naW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItbG9naW5Db250cm9sbGVyJyxcbiAgICAgICAgcmVxdWlyZXNfYW5vbnltOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy91c2VyL3NpZ251cCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy91c2VyLXNpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItU2lnbnVwQ29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2Fub255bTogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvcGhvbmVzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3Bob25lLWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1MaXN0Q3RybCcsXG4gICAgICAgIHJlcXVpcmVzX2F1dGg6IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3Bob25lcy86cGhvbmVJZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy9waG9uZS1kZXRhaWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1EZXRhaWxDdHJsJyxcbiAgICAgICAgcmVxdWlyZXNfYXV0aDogdHJ1ZVxuICAgICAgfSkuXG4gICAgICBvdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnL3Bob25lcydcbiAgICAgIH0pO1xuICB9XG5dKVxuXG4ucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEF1dGhTZXJ2aWNlKSB7XG4gICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgY3VyclJvdXRlLCBwcmV2Um91dGUpIHtcblxuICAgIC8vIEl0IHJlcXVpcmVzIGxvZ2luLlxuICAgIGlmICgncmVxdWlyZXNfYXV0aCcgaW4gY3VyclJvdXRlICYmIGN1cnJSb3V0ZS5yZXF1aXJlc19hdXRoICYmICFBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlci9sb2dpbicpO1xuICAgIH1cblxuICAgIC8vIEl0IHJlcXVpcmVzIGFub255bS5cbiAgICBpZiAoJ3JlcXVpcmVzX2Fub255bScgaW4gY3VyclJvdXRlICYmIGN1cnJSb3V0ZS5yZXF1aXJlc19hbm9ueW0gJiYgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgIH1cbiAgfSk7XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcklkLCB1c2VyUm9sZSkge1xuICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gICAgdGhpcy51c2VyUm9sZSA9IHVzZXJSb2xlO1xuICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gISF1c2VySWQ7XG4gIH07XG5cbiAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMudXNlcklkID0gbnVsbDtcbiAgICB0aGlzLnVzZXJSb2xlID0gbnVsbDtcbiAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZhbHNlO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufSlcblxuLnNlcnZpY2UoJ0xpYicsIGZ1bmN0aW9uIChNZXNzYWdlU2VydmljZSkge1xuICB0aGlzLlNob3dNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSwgaW1wb3J0YW50KSB7XG4gICAgdHlwZSA9IHR5cGUgfCAnaW5mbyc7XG4gICAgaW1wb3J0YW50ID0gaW1wb3J0YW50IHwgdHJ1ZTtcbiAgICBNZXNzYWdlU2VydmljZS5icm9hZGNhc3QobWVzc2FnZSwge2NvbG9yOiB0eXBlLCBpbXBvcnRhbnQ6IGltcG9ydGFudCwgY2xhc3NlczogJ2FsZXJ0IGFsZXJ0LWVycm9yJ30pO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5kaXJlY3RpdmUoJ2VtYWlsVmFsaWRhdG9yJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHJzLCBjdHJsKSB7XG4gICAgICBjdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmlld1ZhbHVlKSB7XG4gICAgICAgICAkaHR0cFxuICAgICAgICAgICAucG9zdCgnL3VzZXIvcmVzdC9lbWFpbF9leGlzdHMnLCB7ZW1haWw6IHZpZXdWYWx1ZX0pXG4gICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgIGlmICghcmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgY3RybC4kc2V0VmFsaWRpdHkoJ2VtYWlsJywgZmFsc2UpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdlbWFpbCcsIHRydWUpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=