angular.module('appModule')

.controller('User-loginController', function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService, Lib) {
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
})

.controller('Phone-ListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('/static/app/phones/phones.json').success(function(data) {
      $scope.phones = data;
    });

    $scope.orderProp = 'age';
  }])

.controller('defaultMenuController', function ($scope, AuthService) {
  $scope.$watch(AuthService.isAuthenticated, function(newVal, oldVal){
    $scope.isAuthenticated = newVal;
  });
})
.controller('Phone-DetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);

