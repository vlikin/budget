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
}])

.controller('Phone-ListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('/static/app/phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }])

.controller('defaultMenuController', ["$scope", "AuthService", "Session", function ($scope, AuthService, Session) {
  $scope.session = Session;
  
  $scope.logout = function() {
    AuthService.logout();
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
    this.isAuthenticated = !!sessionId;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
    this.isAuthenticated = null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSxnQkFBQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7RUFDQTtBQUNBOztBQ2ZBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7SUFDQTtFQUNBO0FBQ0E7QUNuQkE7O0FBRUEsYUFBQSxvQkFBQSxHQUFBLHVGQUFBO0VBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7TUFDQTtJQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBOztBQUVBLGFBQUEscUJBQUEsR0FBQSwyRUFBQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUE7RUFDQTtJQUNBO01BQ0E7SUFDQTs7SUFFQTtFQUNBOztBQUVBLGFBQUEscUJBQUEsR0FBQSxxQ0FBQTtFQUNBOztFQUVBO0lBQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGdCQUFBO0VBQ0E7SUFDQTtFQUNBOzs7QUNoREE7O0FBRUEsVUFBQSxXQUFBLEdBQUEsbUNBQUE7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7VUFDQTtRQUNBOztRQUVBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7UUFDQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtFQUNBOztFQUVBO0lBQ0E7TUFDQTtJQUNBO0lBQ0E7TUFDQTtFQUNBOztFQUVBO0FBQ0EsQ0FBQSxDQUFBO0FDakRBOztBQUVBO0VBQ0E7SUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLG9CQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLHFCQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLGNBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBLGFBQUEsZ0JBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0VBQ0E7QUFDQTs7QUFFQSxLQUFBLDJDQUFBO0VBQ0E7O0lBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTs7SUFFQTtJQUNBO01BQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7QUM5Q0E7O0FBRUEsVUFBQSxPQUFBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtFQUNBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtFQUNBO0VBQ0E7QUFDQTs7QUFFQSxVQUFBLEdBQUEsR0FBQSxtQkFBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7QUFDQSxDQUFBLENBQUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScsIFtcbiAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICduZ1JvdXRlJyxcbiAgJ01lc3NhZ2VDZW50ZXInLFxuICAnYW5ndWxhci1sb2FkaW5nLWJhcicsXG4gICduZ0FuaW1hdGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7IFxuICBBdXRoU2VydmljZS5nZXRfY3VycmVudF91c2VyKCk7XG59KVxuLmNvbmZpZyhbJ2NmcExvYWRpbmdCYXJQcm92aWRlcicsIGZ1bmN0aW9uKGNmcExvYWRpbmdCYXJQcm92aWRlcikge1xuICBjZnBMb2FkaW5nQmFyUHJvdmlkZXIuaW5jbHVkZVNwaW5uZXIgPSB0cnVlO1xufV0pO1xuIiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG59KVxuLmNvbnN0YW50KCdVU0VSX1JPTEVTJywge1xuICBhbGw6ICcqJyxcbiAgYWRtaW46ICdhZG1pbicsXG4gIGVkaXRvcjogJ2VkaXRvcicsXG4gIGd1ZXN0OiAnZ3Vlc3QnXG59KVxuLmNvbnN0YW50KCdTRVRUSU5HUycsIHtcbiAgdXNlcjoge1xuICAgIHN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb246ICcvJ1xuICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmNvbnRyb2xsZXIoJ1VzZXItbG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBVVRIX0VWRU5UUywgQXV0aFNlcnZpY2UsIExpYiwgU0VUVElOR1MpIHtcbiAgJHNjb3BlLmNyZWRlbnRpYWxzID0ge1xuICAgIHVzZXJuYW1lOiAndXNlciAxJyxcbiAgICBwYXNzd29yZDogJ3VzZXIgMSdcbiAgfTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICBBdXRoU2VydmljZS5sb2dpbihjcmVkZW50aWFscykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAkbG9jYXRpb24ucGF0aChTRVRUSU5HUy51c2VyLnN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb24pO1xuICAgICAgICBMaWIuU2hvd01lc3NhZ2UoZGF0YS5tZXNzYWdlLCAnc3VjY2VzcycpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIExpYi5TaG93TWVzc2FnZShkYXRhLm1lc3NhZ2UsICd3YXJuaW5nJyk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luRmFpbGVkKTtcbiAgICB9KTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdVc2VyLVNpZ251cENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEFVVEhfRVZFTlRTLCBBdXRoU2VydmljZSwgTGliKSB7XG59KVxuXG4uY29udHJvbGxlcignUGhvbmUtTGlzdEN0cmwnLCBbJyRzY29wZScsICckaHR0cCcsXG4gIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwKSB7XG4gICAgJGh0dHAuZ2V0KCcvc3RhdGljL2FwcC9waG9uZXMvcGhvbmVzLmpzb24nKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5waG9uZXMgPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLm9yZGVyUHJvcCA9ICdhZ2UnO1xuICB9XSlcblxuLmNvbnRyb2xsZXIoJ2RlZmF1bHRNZW51Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCBTZXNzaW9uKSB7XG4gICRzY29wZS5zZXNzaW9uID0gU2Vzc2lvbjtcbiAgXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBBdXRoU2VydmljZS5sb2dvdXQoKTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdQaG9uZS1EZXRhaWxDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJyxcbiAgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcbiAgICAkc2NvcGUucGhvbmVJZCA9ICRyb3V0ZVBhcmFtcy5waG9uZUlkO1xuICB9XSk7XG5cbiIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmZhY3RvcnkoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCBVU0VSX1JPTEVTKSB7XG4gIHZhciBhdXRoU2VydmljZSA9IHt9O1xuIFxuICBhdXRoU2VydmljZS5nZXRfY3VycmVudF91c2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvY3VycmVudCcpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIFNlc3Npb24uY3JlYXRlKCdTRVNTSUQnLCByZXMuZGF0YS5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgIHJldHVybiAkaHR0cFxuICAgICAgLnBvc3QoJy91c2VyL3Jlc3QvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShyZXMuZGF0YS5pZCwgcmVzLmRhdGEudXNlci5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UubG9nb3V0ID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvbG9nb3V0JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhIVNlc3Npb24udXNlcklkO1xuICB9O1xuIFxuICBhdXRoU2VydmljZS5pc0F1dGhvcml6ZWQgPSBmdW5jdGlvbiAoYXV0aG9yaXplZFJvbGVzKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoYXV0aG9yaXplZFJvbGVzKSkge1xuICAgICAgYXV0aG9yaXplZFJvbGVzID0gW2F1dGhvcml6ZWRSb2xlc107XG4gICAgfVxuICAgIHJldHVybiAoYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgJiZcbiAgICAgIGF1dGhvcml6ZWRSb2xlcy5pbmRleE9mKFNlc3Npb24udXNlclJvbGUpICE9PSAtMSk7XG4gIH07XG4gXG4gIHJldHVybiBhdXRoU2VydmljZTtcbn0pOyIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJyxcbiAgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICAkcm91dGVQcm92aWRlci5cbiAgICAgIHdoZW4oJy91c2VyL2xvZ2luJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VzZXItbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLWxvZ2luQ29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2Fub255bTogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvdXNlci9zaWdudXAnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1zaWdudXAuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLVNpZ251cENvbnRyb2xsZXInLFxuICAgICAgICByZXF1aXJlc19hbm9ueW06IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3Bob25lcycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy9waG9uZS1saXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvbmUtTGlzdEN0cmwnLFxuICAgICAgICByZXF1aXJlc19hdXRoOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy9waG9uZXMvOnBob25lSWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvcGhvbmUtZGV0YWlsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvbmUtRGV0YWlsQ3RybCcsXG4gICAgICAgIHJlcXVpcmVzX2F1dGg6IHRydWVcbiAgICAgIH0pLlxuICAgICAgb3RoZXJ3aXNlKHtcbiAgICAgICAgcmVkaXJlY3RUbzogJy9waG9uZXMnXG4gICAgICB9KTtcbiAgfVxuXSlcblxuLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBdXRoU2VydmljZSkge1xuICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJSb3V0ZSwgcHJldlJvdXRlKSB7XG5cbiAgICAvLyBJdCByZXF1aXJlcyBsb2dpbi5cbiAgICBpZiAoJ3JlcXVpcmVzX2F1dGgnIGluIGN1cnJSb3V0ZSAmJiBjdXJyUm91dGUucmVxdWlyZXNfYXV0aCAmJiAhQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnL3VzZXIvbG9naW4nKTtcbiAgICB9XG5cbiAgICAvLyBJdCByZXF1aXJlcyBhbm9ueW0uXG4gICAgaWYgKCdyZXF1aXJlc19hbm9ueW0nIGluIGN1cnJSb3V0ZSAmJiBjdXJyUm91dGUucmVxdWlyZXNfYW5vbnltICYmIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICB9XG4gIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCkge1xuICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXJJZCwgdXNlclJvbGUpIHtcbiAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgIHRoaXMudXNlcklkID0gdXNlcklkO1xuICAgIHRoaXMudXNlclJvbGUgPSB1c2VyUm9sZTtcbiAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9ICEhc2Vzc2lvbklkO1xuICB9O1xuICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pZCA9IG51bGw7XG4gICAgdGhpcy51c2VySWQgPSBudWxsO1xuICAgIHRoaXMudXNlclJvbGUgPSBudWxsO1xuICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gbnVsbDtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KVxuXG4uc2VydmljZSgnTGliJywgZnVuY3Rpb24gKE1lc3NhZ2VTZXJ2aWNlKSB7XG4gIHRoaXMuU2hvd01lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlLCBpbXBvcnRhbnQpIHtcbiAgICB0eXBlID0gdHlwZSB8ICdpbmZvJztcbiAgICBpbXBvcnRhbnQgPSBpbXBvcnRhbnQgfCB0cnVlO1xuICAgIE1lc3NhZ2VTZXJ2aWNlLmJyb2FkY2FzdChtZXNzYWdlLCB7Y29sb3I6IHR5cGUsIGltcG9ydGFudDogaW1wb3J0YW50LCBjbGFzc2VzOiAnYWxlcnQgYWxlcnQtZXJyb3InfSk7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXM7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=