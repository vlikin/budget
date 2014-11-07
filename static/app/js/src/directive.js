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