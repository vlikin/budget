angular.module('appModule')

.controller('User-loginController', function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService, Lib, SETTINGS) {
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
})

.controller('User-ProfileViewController', function () {
})

.controller('User-ProfileEditController', function () {
})

.controller('User-SignupController', function ($scope, $location, $http, AuthService, Lib) {
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
})

.controller('Phone-ListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('/static/app/phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }])

.controller('defaultMenuController', function ($scope, $location, AuthService, Session) {
  $scope.session = Session;
  
  $scope.logout = function() {
    AuthService.logout();
    $location.path('/');
  };
})

.controller('Phone-DetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);

