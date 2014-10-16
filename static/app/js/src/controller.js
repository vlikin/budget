angular.module('appModule')

.controller('User-loginController', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
  console.log('init');
  $scope.credentials = {
    username: 'login',
    password: 'password'
  };

  $scope.message = {
    text:'',
    type:''
  };

  $scope.login = function (credentials) {
    AuthService.login(credentials).then(function (data) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      if (data.success) {
        $scope.message.type = 'success';
      }
      else {
        $scope.message.type = 'warning';
      }
      $scope.message.text = data.message;
      console.log($scope.message);
      //$scope.setCurrentUser(user);
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
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

.controller('Phone-DetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.phoneId = $routeParams.phoneId;
  }]);

