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