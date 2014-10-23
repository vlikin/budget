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
  console.log('emailValidator');
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        console.log('validation');
        ctrl.$setValidity('email', false);
      });
    }
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiLCJ2YWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSxnQkFBQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7RUFDQTtBQUNBOztBQ2ZBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7SUFDQTtFQUNBO0FBQ0E7QUNuQkE7O0FBRUEsYUFBQSxvQkFBQSxHQUFBLHVGQUFBO0VBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7TUFDQTtJQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBOztBQUVBLGFBQUEscUJBQUEsR0FBQSwyRUFBQTtFQUNBOztFQUVBO0lBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBO0VBQ0E7SUFDQTtNQUNBO0lBQ0E7O0lBRUE7RUFDQTs7QUFFQSxhQUFBLHFCQUFBLEdBQUEsa0RBQUE7RUFDQTs7RUFFQTtJQUNBO0lBQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGdCQUFBO0VBQ0E7SUFDQTtFQUNBOzs7QUN4REE7O0FBRUEsVUFBQSxXQUFBLEdBQUEsbUNBQUE7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7VUFDQTtRQUNBOztRQUVBO01BQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7UUFDQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtFQUNBOztFQUVBO0lBQ0E7TUFDQTtJQUNBO0lBQ0E7TUFDQTtFQUNBOztFQUVBO0FBQ0EsQ0FBQSxDQUFBO0FDakRBOztBQUVBO0VBQ0E7SUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLG9CQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLHFCQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLGNBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtRQUNBLGFBQUEsZ0JBQUE7UUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0VBQ0E7QUFDQTs7QUFFQSxLQUFBLDJDQUFBO0VBQ0E7O0lBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTs7SUFFQTtJQUNBO01BQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7QUM5Q0E7O0FBRUEsVUFBQSxPQUFBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtFQUNBOztFQUVBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtBQUNBOztBQUVBLFVBQUEsR0FBQSxHQUFBLG1CQUFBO0VBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtBQUNBLENBQUEsQ0FBQTtBQzVCQTs7QUFFQSxZQUFBLGNBQUE7RUFDQTtFQUNBO0lBQ0E7SUFDQTtNQUNBO1FBQ0E7UUFDQTtNQUNBO0lBQ0E7RUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnLCBbXG4gICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAnbmdSb3V0ZScsXG4gICdNZXNzYWdlQ2VudGVyJyxcbiAgJ2FuZ3VsYXItbG9hZGluZy1iYXInLFxuICAnbmdBbmltYXRlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbihBdXRoU2VydmljZSkgeyBcbiAgQXV0aFNlcnZpY2UuZ2V0X2N1cnJlbnRfdXNlcigpO1xufSlcbi5jb25maWcoWydjZnBMb2FkaW5nQmFyUHJvdmlkZXInLCBmdW5jdGlvbihjZnBMb2FkaW5nQmFyUHJvdmlkZXIpIHtcbiAgY2ZwTG9hZGluZ0JhclByb3ZpZGVyLmluY2x1ZGVTcGlubmVyID0gdHJ1ZTtcbn1dKTtcbiIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcbi5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xufSlcbi5jb25zdGFudCgnVVNFUl9ST0xFUycsIHtcbiAgYWxsOiAnKicsXG4gIGFkbWluOiAnYWRtaW4nLFxuICBlZGl0b3I6ICdlZGl0b3InLFxuICBndWVzdDogJ2d1ZXN0J1xufSlcbi5jb25zdGFudCgnU0VUVElOR1MnLCB7XG4gIHVzZXI6IHtcbiAgICBzdWNjZXNzX2F1dGhlbnRpY2F0aW9uX3JlZGlyZWN0aW9uOiAnLydcbiAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdVc2VyLWxvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2NhdGlvbiwgQVVUSF9FVkVOVFMsIEF1dGhTZXJ2aWNlLCBMaWIsIFNFVFRJTkdTKSB7XG4gICRzY29wZS5jcmVkZW50aWFscyA9IHtcbiAgICB1c2VybmFtZTogJ3VzZXIgMScsXG4gICAgcGFzc3dvcmQ6ICd1c2VyIDEnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgQXV0aFNlcnZpY2UubG9naW4oY3JlZGVudGlhbHMpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoU0VUVElOR1MudXNlci5zdWNjZXNzX2F1dGhlbnRpY2F0aW9uX3JlZGlyZWN0aW9uKTtcbiAgICAgICAgTGliLlNob3dNZXNzYWdlKGRhdGEubWVzc2FnZSwgJ3N1Y2Nlc3MnKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBMaWIuU2hvd01lc3NhZ2UoZGF0YS5tZXNzYWdlLCAnd2FybmluZycpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpbkZhaWxlZCk7XG4gICAgfSk7XG4gIH07XG59KVxuXG4uY29udHJvbGxlcignVXNlci1TaWdudXBDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBVVRIX0VWRU5UUywgQXV0aFNlcnZpY2UsIExpYikge1xuICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9maWxlID0ge307XG4gIH07XG4gICRzY29wZS5yZWdpc3RlciA9IGZ1bmN0aW9uKCkge1xuICB9O1xufSlcblxuLmNvbnRyb2xsZXIoJ1Bob25lLUxpc3RDdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLFxuICBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCkge1xuICAgICRodHRwLmdldCgnL3N0YXRpYy9hcHAvcGhvbmVzL3Bob25lcy5qc29uJykuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUucGhvbmVzID0gZGF0YTtcbiAgICB9KTtcblxuICAgICRzY29wZS5vcmRlclByb3AgPSAnYWdlJztcbiAgfV0pXG5cbi5jb250cm9sbGVyKCdkZWZhdWx0TWVudUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIEF1dGhTZXJ2aWNlLCBTZXNzaW9uKSB7XG4gICRzY29wZS5zZXNzaW9uID0gU2Vzc2lvbjtcbiAgXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBBdXRoU2VydmljZS5sb2dvdXQoKTtcbiAgICAvLyRsb2NhdGlvbi5wYXRoKCcvJyk7XG4gIH07XG59KVxuXG4uY29udHJvbGxlcignUGhvbmUtRGV0YWlsQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZVBhcmFtcycsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zKSB7XG4gICAgJHNjb3BlLnBob25lSWQgPSAkcm91dGVQYXJhbXMucGhvbmVJZDtcbiAgfV0pO1xuXG4iLCJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5mYWN0b3J5KCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgVVNFUl9ST0xFUykge1xuICB2YXIgYXV0aFNlcnZpY2UgPSB7fTtcblxuICBhdXRoU2VydmljZS5nZXRfY3VycmVudF91c2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvY3VycmVudCcpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIFNlc3Npb24uY3JlYXRlKCdTRVNTSUQnLCByZXMuZGF0YS5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgIHJldHVybiAkaHR0cFxuICAgICAgLnBvc3QoJy91c2VyL3Jlc3QvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShyZXMuZGF0YS5pZCwgcmVzLmRhdGEudXNlci5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UubG9nb3V0ID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvbG9nb3V0JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhIVNlc3Npb24udXNlcklkO1xuICB9O1xuIFxuICBhdXRoU2VydmljZS5pc0F1dGhvcml6ZWQgPSBmdW5jdGlvbiAoYXV0aG9yaXplZFJvbGVzKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoYXV0aG9yaXplZFJvbGVzKSkge1xuICAgICAgYXV0aG9yaXplZFJvbGVzID0gW2F1dGhvcml6ZWRSb2xlc107XG4gICAgfVxuICAgIHJldHVybiAoYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgJiZcbiAgICAgIGF1dGhvcml6ZWRSb2xlcy5pbmRleE9mKFNlc3Npb24udXNlclJvbGUpICE9PSAtMSk7XG4gIH07XG4gXG4gIHJldHVybiBhdXRoU2VydmljZTtcbn0pOyIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJyxcbiAgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICAkcm91dGVQcm92aWRlci5cbiAgICAgIHdoZW4oJy91c2VyL2xvZ2luJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VzZXItbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLWxvZ2luQ29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2Fub255bTogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvdXNlci9zaWdudXAnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1zaWdudXAuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLVNpZ251cENvbnRyb2xsZXInLFxuICAgICAgICByZXF1aXJlc19hbm9ueW06IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3Bob25lcycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy9waG9uZS1saXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvbmUtTGlzdEN0cmwnLFxuICAgICAgICByZXF1aXJlc19hdXRoOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy9waG9uZXMvOnBob25lSWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvcGhvbmUtZGV0YWlsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvbmUtRGV0YWlsQ3RybCcsXG4gICAgICAgIHJlcXVpcmVzX2F1dGg6IHRydWVcbiAgICAgIH0pLlxuICAgICAgb3RoZXJ3aXNlKHtcbiAgICAgICAgcmVkaXJlY3RUbzogJy9waG9uZXMnXG4gICAgICB9KTtcbiAgfVxuXSlcblxuLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBdXRoU2VydmljZSkge1xuICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJSb3V0ZSwgcHJldlJvdXRlKSB7XG5cbiAgICAvLyBJdCByZXF1aXJlcyBsb2dpbi5cbiAgICBpZiAoJ3JlcXVpcmVzX2F1dGgnIGluIGN1cnJSb3V0ZSAmJiBjdXJyUm91dGUucmVxdWlyZXNfYXV0aCAmJiAhQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnL3VzZXIvbG9naW4nKTtcbiAgICB9XG5cbiAgICAvLyBJdCByZXF1aXJlcyBhbm9ueW0uXG4gICAgaWYgKCdyZXF1aXJlc19hbm9ueW0nIGluIGN1cnJSb3V0ZSAmJiBjdXJyUm91dGUucmVxdWlyZXNfYW5vbnltICYmIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICB9XG4gIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCkge1xuICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXJJZCwgdXNlclJvbGUpIHtcbiAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgIHRoaXMudXNlcklkID0gdXNlcklkO1xuICAgIHRoaXMudXNlclJvbGUgPSB1c2VyUm9sZTtcbiAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9ICEhdXNlcklkO1xuICB9O1xuXG4gIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlkID0gbnVsbDtcbiAgICB0aGlzLnVzZXJJZCA9IG51bGw7XG4gICAgdGhpcy51c2VyUm9sZSA9IG51bGw7XG4gICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcbiAgfTtcblxuICByZXR1cm4gdGhpcztcbn0pXG5cbi5zZXJ2aWNlKCdMaWInLCBmdW5jdGlvbiAoTWVzc2FnZVNlcnZpY2UpIHtcbiAgdGhpcy5TaG93TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUsIGltcG9ydGFudCkge1xuICAgIHR5cGUgPSB0eXBlIHwgJ2luZm8nO1xuICAgIGltcG9ydGFudCA9IGltcG9ydGFudCB8IHRydWU7XG4gICAgTWVzc2FnZVNlcnZpY2UuYnJvYWRjYXN0KG1lc3NhZ2UsIHtjb2xvcjogdHlwZSwgaW1wb3J0YW50OiBpbXBvcnRhbnQsIGNsYXNzZXM6ICdhbGVydCBhbGVydC1lcnJvcid9KTtcbiAgfTtcblxuICByZXR1cm4gdGhpcztcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uZGlyZWN0aXZlKCdlbWFpbFZhbGlkYXRvcicsIGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnZW1haWxWYWxpZGF0b3InKTtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIGN0cmwuJHBhcnNlcnMudW5zaGlmdChmdW5jdGlvbih2aWV3VmFsdWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3ZhbGlkYXRpb24nKTtcbiAgICAgICAgY3RybC4kc2V0VmFsaWRpdHkoJ2VtYWlsJywgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9