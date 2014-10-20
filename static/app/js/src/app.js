'use strict';

var app = angular.module('appModule', [
  'LocalStorageModule',
  'ngRoute',
  'MessageCenter',
  'angular-loading-bar',
  'ngAnimate'
])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = true;
}]);
