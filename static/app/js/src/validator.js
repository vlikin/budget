angular.module('appModule')

.directive('emailValidator', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
         $http
           .post('/user/rest/email_exists', {email: viewValue})
           .then(function(res) {
             if (!res.data.success) {
               ctrl.$setValidity('email', false);
             }
             else {
               ctrl.$setValidity('email', true);
             }
           });
      });
    }
  };
});