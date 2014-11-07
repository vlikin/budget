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
    email: 'user_1@example.com',
    password: 'user_1'
  };

  $scope.login = function (credentials) {
    if (!credentials.email || !credentials.password) {
      Lib.ShowMessage('Fill credentials :)', 'warning');
      return;
    }
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

.controller('User-ProfileViewController', ["$scope", "$http", function ($scope, $http) {
  $scope.profile = {};
  $http
    .get('/user/profile/get')
    .then(function (res) {
      $scope.profile = res.data;
    });
}])

.controller('User-ProfileEditController', ["$scope", "$http", function ($scope, $http) {
  $scope.profile = {};
  $http
    .get('/user/profile/get')
    .then(function (res) {

      $scope.profile = res.data;
      console.log($scope.profile);
    });
}])

.controller('User-SignupController', ["$scope", "$location", "$http", "AuthService", "Lib", function ($scope, $location, $http, AuthService, Lib) {
  $scope.profile = {};

  $scope.reset = function() {
    $scope.profile = {};
  };

  $scope.register = function(profile) {
    return $http
      .post('/user/rest/register', profile)
      .then(function (res) {
        if (res.data.success) {
          $location.path('/user/login');
          Lib.ShowMessage('You have been registered into the system successfully.', 'success');
        }

        return res.data;
      });
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
    $location.path('/');
  };
}])

.controller('Phone-DetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);


var app = angular.module('appModule')

.directive('sameAs', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        console.log(viewValue);
        console.log(scope.$eval(attrs.sameAs));
        if (viewValue === scope.$eval(attrs.sameAs)) {
          ctrl.$setValidity('sameAs', true);
          return viewValue;
        } else {
          ctrl.$setValidity('sameAs', false);
          return viewValue;
        }
      });
    }
  };
})
.directive('uiInput', function() {
  return {
    restrict: 'E',
    templateUrl: '/static/app/partials/ui/input.html',
    //transclude: true,
    scope: {},
    link: function(scope, element, attrs) {
      scope.attrs = attrs;
    }
  };
});
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

.directive('emailValidator', ["$http", function($http) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        console.log(ctrl.$parsers);
        if ('loading' in this && this.loading) {
          return viewValue;
        }
        this.loading = true;
        $http
          .post('/user/rest/email_is_free', {email: viewValue})
          .then(function(res) {
            this.loading = false;
            if (!res.data.success) {
              ctrl.$setValidity('email', false);
            }
            else {
              ctrl.$setValidity('email', true);
            }
          });
        return viewValue;
      });
    }
  };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImRpcmVjdGl2ZS5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiLCJ2YWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSxnQkFBQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7RUFDQTtBQUNBOztBQ2ZBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7SUFDQTtFQUNBO0FBQ0E7QUNuQkE7O0FBRUEsYUFBQSxvQkFBQSxHQUFBLHVGQUFBO0VBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0E7UUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0lBQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7O0FBRUEsYUFBQSwwQkFBQSxHQUFBLG9CQUFBO0VBQ0E7RUFDQTtJQUNBO0lBQ0E7TUFDQTtJQUNBO0FBQ0EsQ0FBQSxDQUFBOztBQUVBLGFBQUEsMEJBQUEsR0FBQSxvQkFBQTtFQUNBO0VBQ0E7SUFDQTtJQUNBOztNQUVBO01BQ0E7SUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLHFCQUFBLEdBQUEsdURBQUE7RUFDQTs7RUFFQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtVQUNBO1VBQ0E7UUFDQTs7UUFFQTtNQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBO0VBQ0E7SUFDQTtNQUNBO0lBQ0E7O0lBRUE7RUFDQTs7QUFFQSxhQUFBLHFCQUFBLEdBQUEsa0RBQUE7RUFDQTs7RUFFQTtJQUNBO0lBQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGdCQUFBO0VBQ0E7SUFDQTtFQUNBOzs7QUMzRkE7O0FBRUEsWUFBQSxNQUFBO0VBQ0E7SUFDQTtJQUNBO01BQ0E7UUFDQTtRQUNBO1FBQ0E7VUFDQTtVQUNBO1FBQ0E7VUFDQTtVQUNBO1FBQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQTtBQUNBLFlBQUEsT0FBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtNQUNBO0lBQ0E7RUFDQTtBQUNBO0FDOUJBOztBQUVBLFVBQUEsV0FBQSxHQUFBLG1DQUFBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtVQUNBO1VBQ0E7UUFDQTs7UUFFQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtVQUNBO1FBQ0E7TUFDQTtFQUNBOztFQUVBO0lBQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7SUFDQTtJQUNBO01BQ0E7RUFDQTs7RUFFQTtBQUNBLENBQUEsQ0FBQTtBQ2pEQTs7QUFFQTtFQUNBO0lBQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxvQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxxQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSwwQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSwwQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxjQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLGdCQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7TUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSwyQ0FBQTtFQUNBOztJQUVBO0lBQ0E7TUFDQTtNQUNBO0lBQ0E7O0lBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FDeERBOztBQUVBLFVBQUEsT0FBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7QUFDQTs7QUFFQSxVQUFBLEdBQUEsR0FBQSxtQkFBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7QUFDQSxDQUFBLENBQUE7QUM1QkE7O0FBRUEsWUFBQSxjQUFBLEdBQUEsVUFBQTtFQUNBO0lBQ0E7SUFDQTtNQUNBO1FBQ0E7UUFDQTtVQUNBO1FBQ0E7UUFDQTtRQUNBO1VBQ0E7VUFDQTtZQUNBO1lBQ0E7Y0FDQTtZQUNBO1lBQ0E7Y0FDQTtZQUNBO1VBQ0E7UUFDQTtNQUNBO0lBQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJywgW1xuICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcbiAgJ25nUm91dGUnLFxuICAnTWVzc2FnZUNlbnRlcicsXG4gICdhbmd1bGFyLWxvYWRpbmctYmFyJyxcbiAgJ25nQW5pbWF0ZSdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oQXV0aFNlcnZpY2UpIHsgXG4gIEF1dGhTZXJ2aWNlLmdldF9jdXJyZW50X3VzZXIoKTtcbn0pXG4uY29uZmlnKFsnY2ZwTG9hZGluZ0JhclByb3ZpZGVyJywgZnVuY3Rpb24oY2ZwTG9hZGluZ0JhclByb3ZpZGVyKSB7XG4gIGNmcExvYWRpbmdCYXJQcm92aWRlci5pbmNsdWRlU3Bpbm5lciA9IHRydWU7XG59XSk7XG4iLCJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG4uY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbn0pXG4uY29uc3RhbnQoJ1VTRVJfUk9MRVMnLCB7XG4gIGFsbDogJyonLFxuICBhZG1pbjogJ2FkbWluJyxcbiAgZWRpdG9yOiAnZWRpdG9yJyxcbiAgZ3Vlc3Q6ICdndWVzdCdcbn0pXG4uY29uc3RhbnQoJ1NFVFRJTkdTJywge1xuICB1c2VyOiB7XG4gICAgc3VjY2Vzc19hdXRoZW50aWNhdGlvbl9yZWRpcmVjdGlvbjogJy8nXG4gIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uY29udHJvbGxlcignVXNlci1sb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEFVVEhfRVZFTlRTLCBBdXRoU2VydmljZSwgTGliLCBTRVRUSU5HUykge1xuICAkc2NvcGUuY3JlZGVudGlhbHMgPSB7XG4gICAgZW1haWw6ICd1c2VyXzFAZXhhbXBsZS5jb20nLFxuICAgIHBhc3N3b3JkOiAndXNlcl8xJ1xuICB9O1xuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgIGlmICghY3JlZGVudGlhbHMuZW1haWwgfHwgIWNyZWRlbnRpYWxzLnBhc3N3b3JkKSB7XG4gICAgICBMaWIuU2hvd01lc3NhZ2UoJ0ZpbGwgY3JlZGVudGlhbHMgOiknLCAnd2FybmluZycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBBdXRoU2VydmljZS5sb2dpbihjcmVkZW50aWFscykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAkbG9jYXRpb24ucGF0aChTRVRUSU5HUy51c2VyLnN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb24pO1xuICAgICAgICBMaWIuU2hvd01lc3NhZ2UoZGF0YS5tZXNzYWdlLCAnc3VjY2VzcycpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIExpYi5TaG93TWVzc2FnZShkYXRhLm1lc3NhZ2UsICd3YXJuaW5nJyk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luRmFpbGVkKTtcbiAgICB9KTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdVc2VyLVByb2ZpbGVWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwKSB7XG4gICRzY29wZS5wcm9maWxlID0ge307XG4gICRodHRwXG4gICAgLmdldCgnL3VzZXIvcHJvZmlsZS9nZXQnKVxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICRzY29wZS5wcm9maWxlID0gcmVzLmRhdGE7XG4gICAgfSk7XG59KVxuXG4uY29udHJvbGxlcignVXNlci1Qcm9maWxlRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCkge1xuICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuICAkaHR0cFxuICAgIC5nZXQoJy91c2VyL3Byb2ZpbGUvZ2V0JylcbiAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cbiAgICAgICRzY29wZS5wcm9maWxlID0gcmVzLmRhdGE7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUucHJvZmlsZSk7XG4gICAgfSk7XG59KVxuXG4uY29udHJvbGxlcignVXNlci1TaWdudXBDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGxvY2F0aW9uLCAkaHR0cCwgQXV0aFNlcnZpY2UsIExpYikge1xuICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9maWxlID0ge307XG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24ocHJvZmlsZSkge1xuICAgIHJldHVybiAkaHR0cFxuICAgICAgLnBvc3QoJy91c2VyL3Jlc3QvcmVnaXN0ZXInLCBwcm9maWxlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlci9sb2dpbicpO1xuICAgICAgICAgIExpYi5TaG93TWVzc2FnZSgnWW91IGhhdmUgYmVlbiByZWdpc3RlcmVkIGludG8gdGhlIHN5c3RlbSBzdWNjZXNzZnVsbHkuJywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgIH0pO1xuICB9O1xufSlcblxuLmNvbnRyb2xsZXIoJ1Bob25lLUxpc3RDdHJsJywgWyckc2NvcGUnLCAnJGh0dHAnLFxuICBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCkge1xuICAgICRodHRwLmdldCgnL3N0YXRpYy9hcHAvcGhvbmVzL3Bob25lcy5qc29uJykuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUucGhvbmVzID0gZGF0YTtcbiAgICB9KTtcblxuICAgICRzY29wZS5vcmRlclByb3AgPSAnYWdlJztcbiAgfV0pXG5cbi5jb250cm9sbGVyKCdkZWZhdWx0TWVudUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIEF1dGhTZXJ2aWNlLCBTZXNzaW9uKSB7XG4gICRzY29wZS5zZXNzaW9uID0gU2Vzc2lvbjtcbiAgXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBBdXRoU2VydmljZS5sb2dvdXQoKTtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICB9O1xufSlcblxuLmNvbnRyb2xsZXIoJ1Bob25lLURldGFpbEN0cmwnLCBbJyRzY29wZScsICckcm91dGVQYXJhbXMnLFxuICBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcykge1xuICAgICRzY29wZS5waG9uZUlkID0gJHJvdXRlUGFyYW1zLnBob25lSWQ7XG4gIH1dKTtcblxuIiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uZGlyZWN0aXZlKCdzYW1lQXMnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIGN0cmwuJHBhcnNlcnMudW5zaGlmdChmdW5jdGlvbih2aWV3VmFsdWUpIHtcbiAgICAgICAgY29uc29sZS5sb2codmlld1ZhbHVlKTtcbiAgICAgICAgY29uc29sZS5sb2coc2NvcGUuJGV2YWwoYXR0cnMuc2FtZUFzKSk7XG4gICAgICAgIGlmICh2aWV3VmFsdWUgPT09IHNjb3BlLiRldmFsKGF0dHJzLnNhbWVBcykpIHtcbiAgICAgICAgICBjdHJsLiRzZXRWYWxpZGl0eSgnc2FtZUFzJywgdHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdHJsLiRzZXRWYWxpZGl0eSgnc2FtZUFzJywgZmFsc2UpO1xuICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pXG4uZGlyZWN0aXZlKCd1aUlucHV0JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VpL2lucHV0Lmh0bWwnLFxuICAgIC8vdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBzY29wZToge30sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5hdHRycyA9IGF0dHJzO1xuICAgIH1cbiAgfTtcbn0pOyIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmZhY3RvcnkoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCBVU0VSX1JPTEVTKSB7XG4gIHZhciBhdXRoU2VydmljZSA9IHt9O1xuXG4gIGF1dGhTZXJ2aWNlLmdldF9jdXJyZW50X3VzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cFxuICAgICAgLmdldCgnL3VzZXIvcmVzdC9jdXJyZW50JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgU2Vzc2lvbi5jcmVhdGUoJ1NFU1NJRCcsIHJlcy5kYXRhLmlkLCBVU0VSX1JPTEVTLmFkbWluKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGF1dGhTZXJ2aWNlLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgcmV0dXJuICRodHRwXG4gICAgICAucG9zdCgnL3VzZXIvcmVzdC9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgIFNlc3Npb24uY3JlYXRlKHJlcy5kYXRhLmlkLCByZXMuZGF0YS51c2VyLmlkLCBVU0VSX1JPTEVTLmFkbWluKTtcbiAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5sb2dvdXQgPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAkaHR0cFxuICAgICAgLmdldCgnL3VzZXIvcmVzdC9sb2dvdXQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhU2Vzc2lvbi51c2VySWQ7XG4gIH07XG4gXG4gIGF1dGhTZXJ2aWNlLmlzQXV0aG9yaXplZCA9IGZ1bmN0aW9uIChhdXRob3JpemVkUm9sZXMpIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShhdXRob3JpemVkUm9sZXMpKSB7XG4gICAgICBhdXRob3JpemVkUm9sZXMgPSBbYXV0aG9yaXplZFJvbGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIChhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSAmJlxuICAgICAgYXV0aG9yaXplZFJvbGVzLmluZGV4T2YoU2Vzc2lvbi51c2VyUm9sZSkgIT09IC0xKTtcbiAgfTtcbiBcbiAgcmV0dXJuIGF1dGhTZXJ2aWNlO1xufSk7IiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLFxuICBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyLlxuICAgICAgd2hlbignL3VzZXIvbG9naW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItbG9naW5Db250cm9sbGVyJyxcbiAgICAgICAgcmVxdWlyZXNfYW5vbnltOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy91c2VyL3NpZ251cCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy91c2VyLXNpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItU2lnbnVwQ29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2Fub255bTogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvdXNlci9wcm9maWxlL3ZpZXcnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1wcm9maWxlLXZpZXcuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLVByb2ZpbGVWaWV3Q29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2F1dGg6IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3VzZXIvcHJvZmlsZS9lZGl0Jywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VzZXItcHJvZmlsZS1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVXNlci1Qcm9maWxlRWRpdENvbnRyb2xsZXInLFxuICAgICAgICByZXF1aXJlc19hdXRoOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy9waG9uZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvcGhvbmUtbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bob25lLUxpc3RDdHJsJyxcbiAgICAgICAgcmVxdWlyZXNfYXV0aDogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvcGhvbmVzLzpwaG9uZUlkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3Bob25lLWRldGFpbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bob25lLURldGFpbEN0cmwnLFxuICAgICAgICByZXF1aXJlc19hdXRoOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIG90aGVyd2lzZSh7XG4gICAgICAgIHJlZGlyZWN0VG86ICcvcGhvbmVzJ1xuICAgICAgfSk7XG4gIH1cbl0pXG5cbi5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aFNlcnZpY2UpIHtcbiAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCBjdXJyUm91dGUsIHByZXZSb3V0ZSkge1xuXG4gICAgLy8gSXQgcmVxdWlyZXMgbG9naW4uXG4gICAgaWYgKCdyZXF1aXJlc19hdXRoJyBpbiBjdXJyUm91dGUgJiYgY3VyclJvdXRlLnJlcXVpcmVzX2F1dGggJiYgIUF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c2VyL2xvZ2luJyk7XG4gICAgfVxuXG4gICAgLy8gSXQgcmVxdWlyZXMgYW5vbnltLlxuICAgIGlmICgncmVxdWlyZXNfYW5vbnltJyBpbiBjdXJyUm91dGUgJiYgY3VyclJvdXRlLnJlcXVpcmVzX2Fub255bSAmJiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XG4gICAgfVxuICB9KTtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VySWQsIHVzZXJSb2xlKSB7XG4gICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgICB0aGlzLnVzZXJSb2xlID0gdXNlclJvbGU7XG4gICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSAhIXVzZXJJZDtcbiAgfTtcblxuICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pZCA9IG51bGw7XG4gICAgdGhpcy51c2VySWQgPSBudWxsO1xuICAgIHRoaXMudXNlclJvbGUgPSBudWxsO1xuICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXM7XG59KVxuXG4uc2VydmljZSgnTGliJywgZnVuY3Rpb24gKE1lc3NhZ2VTZXJ2aWNlKSB7XG4gIHRoaXMuU2hvd01lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlLCBpbXBvcnRhbnQpIHtcbiAgICB0eXBlID0gdHlwZSB8ICdpbmZvJztcbiAgICBpbXBvcnRhbnQgPSBpbXBvcnRhbnQgfCB0cnVlO1xuICAgIE1lc3NhZ2VTZXJ2aWNlLmJyb2FkY2FzdChtZXNzYWdlLCB7Y29sb3I6IHR5cGUsIGltcG9ydGFudDogaW1wb3J0YW50LCBjbGFzc2VzOiAnYWxlcnQgYWxlcnQtZXJyb3InfSk7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXM7XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmRpcmVjdGl2ZSgnZW1haWxWYWxpZGF0b3InLCBmdW5jdGlvbigkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRycywgY3RybCkge1xuICAgICAgY3RybC4kcGFyc2Vycy51bnNoaWZ0KGZ1bmN0aW9uKHZpZXdWYWx1ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhjdHJsLiRwYXJzZXJzKTtcbiAgICAgICAgaWYgKCdsb2FkaW5nJyBpbiB0aGlzICYmIHRoaXMubG9hZGluZykge1xuICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHBcbiAgICAgICAgICAucG9zdCgnL3VzZXIvcmVzdC9lbWFpbF9pc19mcmVlJywge2VtYWlsOiB2aWV3VmFsdWV9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIXJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgY3RybC4kc2V0VmFsaWRpdHkoJ2VtYWlsJywgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdlbWFpbCcsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9