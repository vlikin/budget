angular.module('appModule')

.directive('emailValidator', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        console.log(ctrl.$parsers);
        if ('loading' in this && this.loading) {
          return viewValue;
        }
        this.loading = true;
        $http
          .post('/user/rest/email_is_free', {email: viewValue})
          .then(function(res) {
            this.loading = false;
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
});