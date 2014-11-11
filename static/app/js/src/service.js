angular.module('appModule')

.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
    this.isAuthenticated = !!userId;
  };

  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
    this.isAuthenticated = false;
  };

  return this;
})

.service('Lib', function (MessageService) {
  this.ShowMessage = function(message, type, important) {
    type = type | 'info';
    important = important | true;
    MessageService.broadcast(message, {color: type, important: important, classes: 'alert alert-error'});
  };

  return this;
});

.service('BudgetModel', function () {
  this.budget_list = [];
  this.GetList = function() {
    $http
      .get('/user/profile/get')
      .then(function (res) {
        $scope.profile = res.data;
      });
  };

  return this;
});