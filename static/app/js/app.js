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
    email: 'user 1@example.com',
    password: 'user 1'
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

.controller('User-ProfileViewController', function () {
})

.controller('User-ProfileEditController', function () {
})

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
         $http
           .post('/user/rest/email_is_free', {email: viewValue})
           .then(function(res) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImRpcmVjdGl2ZS5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiLCJ2YWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSxnQkFBQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7RUFDQTtBQUNBOztBQ2ZBO0FBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0VBQ0E7SUFDQTtFQUNBO0FBQ0E7QUNuQkE7O0FBRUEsYUFBQSxvQkFBQSxHQUFBLHVGQUFBO0VBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTtJQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0E7UUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0lBQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQSxDQUFBLENBQUE7O0FBRUEsYUFBQSwwQkFBQTtBQUNBOztBQUVBLGFBQUEsMEJBQUE7QUFDQTs7QUFFQSxhQUFBLHFCQUFBLEdBQUEsdURBQUE7RUFDQTs7RUFFQTtJQUNBO0VBQ0E7RUFDQTtNQUNBO01BQ0E7TUFDQTtRQUNBO1VBQ0E7VUFDQTtRQUNBOztRQUVBO01BQ0E7RUFDQTtBQUNBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUE7RUFDQTtJQUNBO01BQ0E7SUFDQTs7SUFFQTtFQUNBOztBQUVBLGFBQUEscUJBQUEsR0FBQSxrREFBQTtFQUNBOztFQUVBO0lBQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBOztBQUVBLGFBQUEsZ0JBQUE7RUFDQTtJQUNBO0VBQ0E7OztBQzVFQTs7QUFFQSxZQUFBLE9BQUE7RUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7TUFDQTtJQUNBO0VBQ0E7QUFDQTtBQ1pBOztBQUVBLFVBQUEsV0FBQSxHQUFBLG1DQUFBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtVQUNBO1VBQ0E7UUFDQTs7UUFFQTtNQUNBO0VBQ0E7O0VBRUE7SUFDQTtNQUNBO01BQ0E7UUFDQTtVQUNBO1FBQ0E7TUFDQTtFQUNBOztFQUVBO0lBQ0E7RUFDQTs7RUFFQTtJQUNBO01BQ0E7SUFDQTtJQUNBO01BQ0E7RUFDQTs7RUFFQTtBQUNBLENBQUEsQ0FBQTtBQ2pEQTs7QUFFQTtFQUNBO0lBQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxvQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxxQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSwwQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSwwQkFBQTtRQUNBO01BQ0E7TUFDQTtRQUNBO1FBQ0EsYUFBQSxjQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7UUFDQSxhQUFBLGdCQUFBO1FBQ0E7TUFDQTtNQUNBO1FBQ0E7TUFDQTtFQUNBO0FBQ0E7O0FBRUEsS0FBQSwyQ0FBQTtFQUNBOztJQUVBO0lBQ0E7TUFDQTtNQUNBO0lBQ0E7O0lBRUE7SUFDQTtNQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBO0FDeERBOztBQUVBLFVBQUEsT0FBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7RUFDQTs7RUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7QUFDQTs7QUFFQSxVQUFBLEdBQUEsR0FBQSxtQkFBQTtFQUNBO0lBQ0E7SUFDQTtJQUNBO0VBQ0E7O0VBRUE7QUFDQSxDQUFBLENBQUE7QUM1QkE7O0FBRUEsWUFBQSxjQUFBLEdBQUEsVUFBQTtFQUNBO0lBQ0E7SUFDQTtNQUNBO1FBQ0E7U0FDQTtXQUNBO1dBQ0E7YUFDQTtlQUNBO2FBQ0E7YUFDQTtlQUNBO2FBQ0E7V0FDQTtRQUNBO01BQ0E7SUFDQTtFQUNBO0FBQ0EsQ0FBQSxDQUFBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnLCBbXG4gICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAnbmdSb3V0ZScsXG4gICdNZXNzYWdlQ2VudGVyJyxcbiAgJ2FuZ3VsYXItbG9hZGluZy1iYXInLFxuICAnbmdBbmltYXRlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbihBdXRoU2VydmljZSkgeyBcbiAgQXV0aFNlcnZpY2UuZ2V0X2N1cnJlbnRfdXNlcigpO1xufSlcbi5jb25maWcoWydjZnBMb2FkaW5nQmFyUHJvdmlkZXInLCBmdW5jdGlvbihjZnBMb2FkaW5nQmFyUHJvdmlkZXIpIHtcbiAgY2ZwTG9hZGluZ0JhclByb3ZpZGVyLmluY2x1ZGVTcGlubmVyID0gdHJ1ZTtcbn1dKTtcbiIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcbi5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xufSlcbi5jb25zdGFudCgnVVNFUl9ST0xFUycsIHtcbiAgYWxsOiAnKicsXG4gIGFkbWluOiAnYWRtaW4nLFxuICBlZGl0b3I6ICdlZGl0b3InLFxuICBndWVzdDogJ2d1ZXN0J1xufSlcbi5jb25zdGFudCgnU0VUVElOR1MnLCB7XG4gIHVzZXI6IHtcbiAgICBzdWNjZXNzX2F1dGhlbnRpY2F0aW9uX3JlZGlyZWN0aW9uOiAnLydcbiAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdVc2VyLWxvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2NhdGlvbiwgQVVUSF9FVkVOVFMsIEF1dGhTZXJ2aWNlLCBMaWIsIFNFVFRJTkdTKSB7XG4gICRzY29wZS5jcmVkZW50aWFscyA9IHtcbiAgICBlbWFpbDogJ3VzZXIgMUBleGFtcGxlLmNvbScsXG4gICAgcGFzc3dvcmQ6ICd1c2VyIDEnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgaWYgKCFjcmVkZW50aWFscy5lbWFpbCB8fCAhY3JlZGVudGlhbHMucGFzc3dvcmQpIHtcbiAgICAgIExpYi5TaG93TWVzc2FnZSgnRmlsbCBjcmVkZW50aWFscyA6KScsICd3YXJuaW5nJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGNyZWRlbnRpYWxzKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKFNFVFRJTkdTLnVzZXIuc3VjY2Vzc19hdXRoZW50aWNhdGlvbl9yZWRpcmVjdGlvbik7XG4gICAgICAgIExpYi5TaG93TWVzc2FnZShkYXRhLm1lc3NhZ2UsICdzdWNjZXNzJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgTGliLlNob3dNZXNzYWdlKGRhdGEubWVzc2FnZSwgJ3dhcm5pbmcnKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5GYWlsZWQpO1xuICAgIH0pO1xuICB9O1xufSlcblxuLmNvbnRyb2xsZXIoJ1VzZXItUHJvZmlsZVZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xufSlcblxuLmNvbnRyb2xsZXIoJ1VzZXItUHJvZmlsZUVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xufSlcblxuLmNvbnRyb2xsZXIoJ1VzZXItU2lnbnVwQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRsb2NhdGlvbiwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBMaWIpIHtcbiAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcblxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuICB9O1xuICAkc2NvcGUucmVnaXN0ZXIgPSBmdW5jdGlvbihwcm9maWxlKSB7XG4gICAgICByZXR1cm4gJGh0dHBcbiAgICAgIC5wb3N0KCcvdXNlci9yZXN0L3JlZ2lzdGVyJywgcHJvZmlsZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3VzZXIvbG9naW4nKTtcbiAgICAgICAgICBMaWIuU2hvd01lc3NhZ2UoJ1lvdSBoYXZlIGJlZW4gcmVnaXN0ZXJlZCBpbnRvIHRoZSBzeXN0ZW0gc3VjY2Vzc2Z1bGx5LicsICdzdWNjZXNzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICB9KTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdQaG9uZS1MaXN0Q3RybCcsIFsnJHNjb3BlJywgJyRodHRwJyxcbiAgZnVuY3Rpb24gKCRzY29wZSwgJGh0dHApIHtcbiAgICAkaHR0cC5nZXQoJy9zdGF0aWMvYXBwL3Bob25lcy9waG9uZXMuanNvbicpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLnBob25lcyA9IGRhdGE7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUub3JkZXJQcm9wID0gJ2FnZSc7XG4gIH1dKVxuXG4uY29udHJvbGxlcignZGVmYXVsdE1lbnVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGxvY2F0aW9uLCBBdXRoU2VydmljZSwgU2Vzc2lvbikge1xuICAkc2NvcGUuc2Vzc2lvbiA9IFNlc3Npb247XG4gIFxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgQXV0aFNlcnZpY2UubG9nb3V0KCk7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdQaG9uZS1EZXRhaWxDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJyxcbiAgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcbiAgICAkc2NvcGUucGhvbmVJZCA9ICRyb3V0ZVBhcmFtcy5waG9uZUlkO1xuICB9XSk7XG5cbiIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmRpcmVjdGl2ZSgndWlJbnB1dCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy91aS9pbnB1dC5odG1sJyxcbiAgICAvL3RyYW5zY2x1ZGU6IHRydWUsXG4gICAgc2NvcGU6IHt9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuYXR0cnMgPSBhdHRycztcbiAgICB9XG4gIH07XG59KTsiLCJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5mYWN0b3J5KCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgVVNFUl9ST0xFUykge1xuICB2YXIgYXV0aFNlcnZpY2UgPSB7fTtcblxuICBhdXRoU2VydmljZS5nZXRfY3VycmVudF91c2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvY3VycmVudCcpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIFNlc3Npb24uY3JlYXRlKCdTRVNTSUQnLCByZXMuZGF0YS5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICB9KTtcbiAgfTtcblxuICBhdXRoU2VydmljZS5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgIHJldHVybiAkaHR0cFxuICAgICAgLnBvc3QoJy91c2VyL3Jlc3QvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShyZXMuZGF0YS5pZCwgcmVzLmRhdGEudXNlci5pZCwgVVNFUl9ST0xFUy5hZG1pbik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UubG9nb3V0ID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgJGh0dHBcbiAgICAgIC5nZXQoJy91c2VyL3Jlc3QvbG9nb3V0JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH07XG5cbiAgYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhIVNlc3Npb24udXNlcklkO1xuICB9O1xuIFxuICBhdXRoU2VydmljZS5pc0F1dGhvcml6ZWQgPSBmdW5jdGlvbiAoYXV0aG9yaXplZFJvbGVzKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoYXV0aG9yaXplZFJvbGVzKSkge1xuICAgICAgYXV0aG9yaXplZFJvbGVzID0gW2F1dGhvcml6ZWRSb2xlc107XG4gICAgfVxuICAgIHJldHVybiAoYXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgJiZcbiAgICAgIGF1dGhvcml6ZWRSb2xlcy5pbmRleE9mKFNlc3Npb24udXNlclJvbGUpICE9PSAtMSk7XG4gIH07XG4gXG4gIHJldHVybiBhdXRoU2VydmljZTtcbn0pOyIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJyxcbiAgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICAkcm91dGVQcm92aWRlci5cbiAgICAgIHdoZW4oJy91c2VyL2xvZ2luJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VzZXItbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLWxvZ2luQ29udHJvbGxlcicsXG4gICAgICAgIHJlcXVpcmVzX2Fub255bTogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvdXNlci9zaWdudXAnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1zaWdudXAuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyLVNpZ251cENvbnRyb2xsZXInLFxuICAgICAgICByZXF1aXJlc19hbm9ueW06IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3VzZXIvcHJvZmlsZS92aWV3Jywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3VzZXItcHJvZmlsZS12aWV3Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVXNlci1Qcm9maWxlVmlld0NvbnRyb2xsZXInLFxuICAgICAgICByZXF1aXJlc19hdXRoOiB0cnVlXG4gICAgICB9KS5cbiAgICAgIHdoZW4oJy91c2VyL3Byb2ZpbGUvZWRpdCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy91c2VyLXByb2ZpbGUtZWRpdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItUHJvZmlsZUVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgcmVxdWlyZXNfYXV0aDogdHJ1ZVxuICAgICAgfSkuXG4gICAgICB3aGVuKCcvcGhvbmVzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3Bob25lLWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1MaXN0Q3RybCcsXG4gICAgICAgIHJlcXVpcmVzX2F1dGg6IHRydWVcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3Bob25lcy86cGhvbmVJZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy9waG9uZS1kZXRhaWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1EZXRhaWxDdHJsJyxcbiAgICAgICAgcmVxdWlyZXNfYXV0aDogdHJ1ZVxuICAgICAgfSkuXG4gICAgICBvdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnL3Bob25lcydcbiAgICAgIH0pO1xuICB9XG5dKVxuXG4ucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEF1dGhTZXJ2aWNlKSB7XG4gICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgY3VyclJvdXRlLCBwcmV2Um91dGUpIHtcblxuICAgIC8vIEl0IHJlcXVpcmVzIGxvZ2luLlxuICAgIGlmICgncmVxdWlyZXNfYXV0aCcgaW4gY3VyclJvdXRlICYmIGN1cnJSb3V0ZS5yZXF1aXJlc19hdXRoICYmICFBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlci9sb2dpbicpO1xuICAgIH1cblxuICAgIC8vIEl0IHJlcXVpcmVzIGFub255bS5cbiAgICBpZiAoJ3JlcXVpcmVzX2Fub255bScgaW4gY3VyclJvdXRlICYmIGN1cnJSb3V0ZS5yZXF1aXJlc19hbm9ueW0gJiYgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgIH1cbiAgfSk7XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcblxuLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcklkLCB1c2VyUm9sZSkge1xuICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gICAgdGhpcy51c2VyUm9sZSA9IHVzZXJSb2xlO1xuICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gISF1c2VySWQ7XG4gIH07XG5cbiAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMudXNlcklkID0gbnVsbDtcbiAgICB0aGlzLnVzZXJSb2xlID0gbnVsbDtcbiAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZhbHNlO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufSlcblxuLnNlcnZpY2UoJ0xpYicsIGZ1bmN0aW9uIChNZXNzYWdlU2VydmljZSkge1xuICB0aGlzLlNob3dNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSwgaW1wb3J0YW50KSB7XG4gICAgdHlwZSA9IHR5cGUgfCAnaW5mbyc7XG4gICAgaW1wb3J0YW50ID0gaW1wb3J0YW50IHwgdHJ1ZTtcbiAgICBNZXNzYWdlU2VydmljZS5icm9hZGNhc3QobWVzc2FnZSwge2NvbG9yOiB0eXBlLCBpbXBvcnRhbnQ6IGltcG9ydGFudCwgY2xhc3NlczogJ2FsZXJ0IGFsZXJ0LWVycm9yJ30pO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5kaXJlY3RpdmUoJ2VtYWlsVmFsaWRhdG9yJywgZnVuY3Rpb24oJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIGN0cmwuJHBhcnNlcnMudW5zaGlmdChmdW5jdGlvbih2aWV3VmFsdWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coY3RybC4kcGFyc2Vycyk7XG4gICAgICAgICAkaHR0cFxuICAgICAgICAgICAucG9zdCgnL3VzZXIvcmVzdC9lbWFpbF9pc19mcmVlJywge2VtYWlsOiB2aWV3VmFsdWV9KVxuICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICBpZiAoIXJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdlbWFpbCcsIGZhbHNlKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICBjdHJsLiRzZXRWYWxpZGl0eSgnZW1haWwnLCB0cnVlKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9