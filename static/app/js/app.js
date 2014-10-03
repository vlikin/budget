'use strict';

var app = angular.module('appModule', [
  'LocalStorageModule',
  'ngRoute',
  'phoneControllers'
]);

app.config(['$routeProvider',
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
  }]);

app.factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
 
    var serviceBase = 'http://ngauthenticationapi.azurewebsites.net/';
    var authServiceFactory = {};
 
    var _authentication = {
        isAuth: false,
        userName : ""
    };
 
    var _saveRegistration = function (registration) {
 
        _logOut();
 
        return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
        });
 
    };
 
    var _login = function (loginData) {

        console.log('_login');
        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;
 
        var deferred = $q.defer();
 
        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {
 
            localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName });
 
            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            console.log(response);
            deferred.resolve(response);
 
        }).error(function (err, status) {
            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            deferred.resolve({a: 's'});
            console.log('error');
            //_logOut();

            //deferred.reject(err);
        });
 
        return deferred.promise;
 
    };
 
    var _logOut = function () {
 
        localStorageService.remove('authorizationData');
 
        _authentication.isAuth = false;
        _authentication.userName = "";
 
    };
 
    var _fillAuthData = function () {
 
        var authData = localStorageService.get('authorizationData');
        if (authData)
        {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
        }
 
    }
 
    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
 
    return authServiceFactory;
}]);

app.factory('authInterceptorService', ['$q', '$location', 'localStorageService', function ($q, $location, localStorageService) {
 
    var authInterceptorServiceFactory = {};
 
    var _request = function (config) {
 
        config.headers = config.headers || {};
 
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }
 
        return config;
    }
 
    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            $location.path('/login');
        }
        return $q.reject(rejection);
    }
 
    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;
 
    return authInterceptorServiceFactory;
}]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

