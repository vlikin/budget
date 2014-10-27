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