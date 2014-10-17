"use strict";var app=angular.module("appModule",["LocalStorageModule","ngRoute"]),app=angular.module("appModule").constant("AUTH_EVENTS",{loginSuccess:"auth-login-success",loginFailed:"auth-login-failed",logoutSuccess:"auth-logout-success",sessionTimeout:"auth-session-timeout",notAuthenticated:"auth-not-authenticated",notAuthorized:"auth-not-authorized"}).constant("USER_ROLES",{all:"*",admin:"admin",editor:"editor",guest:"guest"}).constant("SETTINGS",{user:{success_authentication_redirection:"#/"}});angular.module("appModule").controller("User-loginController",["$scope","$rootScope","$location","AUTH_EVENTS","AuthService",function(e,t,o,n,s){e.credentials={username:"login",password:"password"},e.message={text:"",type:""},e.login=function(a){s.login(a).then(function(s){t.$broadcast(n.loginSuccess),s.success?o.path(SETTINGS.user.success_authentication_redirection):e.message.type="warning",e.message.text=s.message,console.log(e.message)},function(){t.$broadcast(n.loginFailed)})}}]).controller("Phone-ListCtrl",["$scope","$http",function(e,t){t.get("/static/app/phones/phones.json").success(function(t){e.phones=t}),e.orderProp="age"}]).controller("Phone-DetailCtrl",["$scope","$routeParams",function(e,t){e.phoneId=t.phoneId}]);var app=angular.module("appModule").factory("AuthService",["$http","Session","USER_ROLES",function(e,t,o){var n={};return n.login=function(n){return e.post("/user/rest/login",n).then(function(e){return e.data.success?(t.create(e.data.id,e.data.user.id,o.admin),e.data):e.data})},n.isAuthenticated=function(){return!!t.userId},n.isAuthorized=function(e){return angular.isArray(e)||(e=[e]),n.isAuthenticated()&&-1!==e.indexOf(t.userRole)},n}]),app=angular.module("appModule").config(["$routeProvider",function(e){e.when("/user/login",{templateUrl:"/static/app/partials/user-login.html",controller:"User-loginController"}).when("/phones",{templateUrl:"/static/app/partials/phone-list.html",controller:"Phone-ListCtrl"}).when("/phones/:phoneId",{templateUrl:"/static/app/partials/phone-detail.html",controller:"Phone-DetailCtrl"}).otherwise({redirectTo:"/phones"})}]).run(["$rootScope","$location","AuthService",function(e,t,o){e.$on("$routeChangeStart",function(e){o.isAuthenticated()?(console.log("ALLOW"),t.path("#/home")):(console.log("DENY"),e.preventDefault(),t.path("#/login"))})}]);angular.module("appModule").service("Session",function(){return this.create=function(e,t,o){this.id=e,this.userId=t,this.userRole=o},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null},this});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnN0YW50LmpzIiwiY29udHJvbGxlci5qcyIsImZhY3RvcnkuanMiLCJyb3V0ZS5qcyIsInNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFFQSxJQUFBLEtBQUEsUUFBQSxPQUFBLGFBQ0EscUJBQ0EsWUNKQSxJQUFBLFFBQUEsT0FBQSxhQUNBLFNBQUEsZUFDQSxhQUFBLHFCQUNBLFlBQUEsb0JBQ0EsY0FBQSxzQkFDQSxlQUFBLHVCQUNBLGlCQUFBLHlCQUNBLGNBQUEsd0JBRUEsU0FBQSxjQUNBLElBQUEsSUFDQSxNQUFBLFFBQ0EsT0FBQSxTQUNBLE1BQUEsVUFFQSxTQUFBLFlBQ0EsTUFDQSxtQ0FBQSxPQ2pCQSxTQUFBLE9BQUEsYUFFQSxXQUFBLHdCQUFBLFNBQUEsYUFBQSxZQUFBLGNBQUEsY0FBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsR0FDQSxFQUFBLGFBQ0EsU0FBQSxRQUNBLFNBQUEsWUFFQSxFQUFBLFNBQ0EsS0FBQSxHQUNBLEtBQUEsSUFHQSxFQUFBLE1BQUEsU0FBQSxHQUNBLEVBQUEsTUFBQSxHQUFBLEtBQUEsU0FBQSxHQUNBLEVBQUEsV0FBQSxFQUFBLGNBQ0EsRUFBQSxRQUNBLEVBQUEsS0FBQSxTQUFBLEtBQUEsb0NBR0EsRUFBQSxRQUFBLEtBQUEsVUFFQSxFQUFBLFFBQUEsS0FBQSxFQUFBLFFBQ0EsUUFBQSxJQUFBLEVBQUEsVUFFQSxXQUNBLEVBQUEsV0FBQSxFQUFBLG1CQUtBLFdBQUEsa0JBQUEsU0FBQSxRQUNBLFNBQUEsRUFBQSxHQUNBLEVBQUEsSUFBQSxrQ0FBQSxRQUFBLFNBQUEsR0FDQSxFQUFBLE9BQUEsSUFHQSxFQUFBLFVBQUEsU0FHQSxXQUFBLG9CQUFBLFNBQUEsZUFDQSxTQUFBLEVBQUEsR0FDQSxFQUFBLFFBQUEsRUFBQSxVQ3pDQSxJQUFBLEtBQUEsUUFBQSxPQUFBLGFBRUEsUUFBQSxlQUFBLFFBQUEsVUFBQSxhQUFBLFNBQUEsRUFBQSxFQUFBLEdBQ0EsR0FBQSxLQTJCQSxPQXpCQSxHQUFBLE1BQUEsU0FBQSxHQUNBLE1BQUEsR0FDQSxLQUFBLG1CQUFBLEdBQ0EsS0FBQSxTQUFBLEdBQ0EsTUFBQSxHQUFBLEtBQUEsU0FDQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEdBQUEsRUFBQSxLQUFBLEtBQUEsR0FBQSxFQUFBLE9BQ0EsRUFBQSxNQUdBLEVBQUEsUUFJQSxFQUFBLGdCQUFBLFdBQ0EsUUFBQSxFQUFBLFFBR0EsRUFBQSxhQUFBLFNBQUEsR0FJQSxNQUhBLFNBQUEsUUFBQSxLQUNBLEdBQUEsSUFFQSxFQUFBLG1CQUNBLEtBQUEsRUFBQSxRQUFBLEVBQUEsV0FHQSxLQzlCQSxJQUFBLFFBQUEsT0FBQSxhQUVBLFFBQUEsaUJBQ0EsU0FBQSxHQUNBLEVBQ0EsS0FBQSxlQUNBLFlBQUEsdUNBQ0EsV0FBQSx5QkFFQSxLQUFBLFdBQ0EsWUFBQSx1Q0FDQSxXQUFBLG1CQUVBLEtBQUEsb0JBQ0EsWUFBQSx5Q0FDQSxXQUFBLHFCQUVBLFdBQ0EsV0FBQSxlQUtBLEtBQUEsYUFBQSxZQUFBLGNBQUEsU0FBQSxFQUFBLEVBQUEsR0FDQSxFQUFBLElBQUEsb0JBQUEsU0FBQSxHQUVBLEVBQUEsbUJBTUEsUUFBQSxJQUFBLFNBQ0EsRUFBQSxLQUFBLFlBTkEsUUFBQSxJQUFBLFFBQ0EsRUFBQSxpQkFDQSxFQUFBLEtBQUEsZ0JDN0JBLFNBQUEsT0FBQSxhQUVBLFFBQUEsVUFBQSxXQVdBLE1BVkEsTUFBQSxPQUFBLFNBQUEsRUFBQSxFQUFBLEdBQ0EsS0FBQSxHQUFBLEVBQ0EsS0FBQSxPQUFBLEVBQ0EsS0FBQSxTQUFBLEdBRUEsS0FBQSxRQUFBLFdBQ0EsS0FBQSxHQUFBLEtBQ0EsS0FBQSxPQUFBLEtBQ0EsS0FBQSxTQUFBLE1BRUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScsIFtcbiAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICduZ1JvdXRlJyxcbl0pOyIsInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwTW9kdWxlJylcbi5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xufSlcbi5jb25zdGFudCgnVVNFUl9ST0xFUycsIHtcbiAgYWxsOiAnKicsXG4gIGFkbWluOiAnYWRtaW4nLFxuICBlZGl0b3I6ICdlZGl0b3InLFxuICBndWVzdDogJ2d1ZXN0J1xufSlcbi5jb25zdGFudCgnU0VUVElOR1MnLCB7XG4gIHVzZXI6IHtcbiAgICBzdWNjZXNzX2F1dGhlbnRpY2F0aW9uX3JlZGlyZWN0aW9uOiAnIy8nXG4gIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uY29udHJvbGxlcignVXNlci1sb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIEFVVEhfRVZFTlRTLCBBdXRoU2VydmljZSkge1xuICAkc2NvcGUuY3JlZGVudGlhbHMgPSB7XG4gICAgdXNlcm5hbWU6ICdsb2dpbicsXG4gICAgcGFzc3dvcmQ6ICdwYXNzd29yZCdcbiAgfTtcbiAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgdGV4dDonJyxcbiAgICB0eXBlOicnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgQXV0aFNlcnZpY2UubG9naW4oY3JlZGVudGlhbHMpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAkbG9jYXRpb24ucGF0aChTRVRUSU5HUy51c2VyLnN1Y2Nlc3NfYXV0aGVudGljYXRpb25fcmVkaXJlY3Rpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5tZXNzYWdlLnR5cGUgPSAnd2FybmluZyc7XG4gICAgICB9XG4gICAgICAkc2NvcGUubWVzc2FnZS50ZXh0ID0gZGF0YS5tZXNzYWdlO1xuICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1lc3NhZ2UpO1xuICAgICAgLy8kc2NvcGUuc2V0Q3VycmVudFVzZXIodXNlcik7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luRmFpbGVkKTtcbiAgICB9KTtcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdQaG9uZS1MaXN0Q3RybCcsIFsnJHNjb3BlJywgJyRodHRwJyxcbiAgZnVuY3Rpb24gKCRzY29wZSwgJGh0dHApIHtcbiAgICAkaHR0cC5nZXQoJy9zdGF0aWMvYXBwL3Bob25lcy9waG9uZXMuanNvbicpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLnBob25lcyA9IGRhdGE7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUub3JkZXJQcm9wID0gJ2FnZSc7XG4gIH1dKVxuXG4uY29udHJvbGxlcignUGhvbmUtRGV0YWlsQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZVBhcmFtcycsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zKSB7XG4gICAgJHNjb3BlLnBob25lSWQgPSAkcm91dGVQYXJhbXMucGhvbmVJZDtcbiAgfV0pO1xuXG4iLCJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5mYWN0b3J5KCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgVVNFUl9ST0xFUykge1xuICB2YXIgYXV0aFNlcnZpY2UgPSB7fTtcbiBcbiAgYXV0aFNlcnZpY2UubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICByZXR1cm4gJGh0dHBcbiAgICAgIC5wb3N0KCcvdXNlci9yZXN0L2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMuZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgICAgU2Vzc2lvbi5jcmVhdGUocmVzLmRhdGEuaWQsIHJlcy5kYXRhLnVzZXIuaWQsIFVTRVJfUk9MRVMuYWRtaW4pO1xuICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgIH0pO1xuICB9O1xuIFxuICBhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICEhU2Vzc2lvbi51c2VySWQ7XG4gIH07XG4gXG4gIGF1dGhTZXJ2aWNlLmlzQXV0aG9yaXplZCA9IGZ1bmN0aW9uIChhdXRob3JpemVkUm9sZXMpIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShhdXRob3JpemVkUm9sZXMpKSB7XG4gICAgICBhdXRob3JpemVkUm9sZXMgPSBbYXV0aG9yaXplZFJvbGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIChhdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSAmJlxuICAgICAgYXV0aG9yaXplZFJvbGVzLmluZGV4T2YoU2Vzc2lvbi51c2VyUm9sZSkgIT09IC0xKTtcbiAgfTtcbiBcbiAgcmV0dXJuIGF1dGhTZXJ2aWNlO1xufSk7IiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHBNb2R1bGUnKVxuXG4uY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLFxuICBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyLlxuICAgICAgd2hlbignL3VzZXIvbG9naW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3N0YXRpYy9hcHAvcGFydGlhbHMvdXNlci1sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXItbG9naW5Db250cm9sbGVyJ1xuICAgICAgfSkuXG4gICAgICB3aGVuKCcvcGhvbmVzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy9zdGF0aWMvYXBwL3BhcnRpYWxzL3Bob25lLWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1MaXN0Q3RybCdcbiAgICAgIH0pLlxuICAgICAgd2hlbignL3Bob25lcy86cGhvbmVJZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvc3RhdGljL2FwcC9wYXJ0aWFscy9waG9uZS1kZXRhaWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG9uZS1EZXRhaWxDdHJsJ1xuICAgICAgfSkuXG4gICAgICBvdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnL3Bob25lcydcbiAgICAgIH0pO1xuICB9XG5dKVxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMDk2OTgzNS9hbmd1bGFyanMtbG9naW4tYW5kLWF1dGhlbnRpY2F0aW9uLWluLWVhY2gtcm91dGUtYW5kLWNvbnRyb2xsZXJcbi5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aFNlcnZpY2UpIHtcbiAgICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICBpZiAoIUF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnREVOWScpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcjL2xvZ2luJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQUxMT1cnKTtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcjL2hvbWUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcE1vZHVsZScpXG5cbi5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCkge1xuICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXJJZCwgdXNlclJvbGUpIHtcbiAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgIHRoaXMudXNlcklkID0gdXNlcklkO1xuICAgIHRoaXMudXNlclJvbGUgPSB1c2VyUm9sZTtcbiAgfTtcbiAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMudXNlcklkID0gbnVsbDtcbiAgICB0aGlzLnVzZXJSb2xlID0gbnVsbDtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=