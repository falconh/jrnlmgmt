'use strict';
angular.module('myApp',['ngMaterial','ngMessages','ui.router','ngMaterialSidemenu'])
.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange');
})
.run(function($rootScope){
    $rootScope.user = 0;
})
.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider,$stateParams){
    var states = [
        {
            name : 'login',
            url : '/login',
            views:{
                main:{
                    templateUrl: 'html/login.html'
                }
            },
            controller: 'LoginCtrl'
        },
        {
            name : 'mainProfile',
            url : '/general/:userID',
            views:{
                main:{
                    templateUrl: 'html/mainProfile.html'
                }
            },
            controller: 'MainDisplayCtrl'
        }
    ];

    $urlRouterProvider.otherwise('/login');
    states.forEach(function(state){
        $stateProvider.state(state);
    });
}])
.controller('LoginCtrl',['$scope','$rootScope','$state','$stateParams','$http','$q','$location',
function($scope,$state,$stateParams,$rootScope,$http,$q,$location){


    var broadcastSuccess = function(data){
        $rootScope.user = $scope.user.userID ;
        $location.path('/general/' + $rootScope.user);
    };

    $scope.submit = function(){
        var loginReqBody = {
            username : $scope.loginUsername,
            password : $scope.loginPassword
        }

        $http(
            {
                method: 'POST',
                url: 'http://localhost:8080/apis/login',
                data : loginReqBody,
                headers:{
                    'Content-Type':'application/json'
                }
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                
                $scope.user = data;
                //$state.go('mainProfile');
                broadcastSuccess(data);
        });
    };
}])
.controller('MainDisplayCtrl', ['$scope','$mdDialog','$http','$rootScope','$state','$stateParams',
function($scope,$mdDialog,$http,$rootScope,$state,$stateParams){

    var userID = $stateParams.userID;

    var broadcastSuccess = function(data){
        $rootScope.supervisions = data ;
        console.log($rootScope.supervisions);
    };

    $rootScope.$on('NewUserCreated',function(){
        $http(
            {
                method: 'GET',
                url: 'http://localhost:8080/apis/supervision?userID=' + userID,
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                
                $scope.supervisions = data;
                broadcastSuccess(data);
        });
    });

    $http(
            {
                method: 'GET',
                url: 'http://localhost:8080/apis/supervision?userID=' + userID,
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                
                $scope.supervisions = data;
                broadcastSuccess(data);
        });
    

    $scope.months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]

    $scope.journalPlan = {
        January : [
            {
                STUDNT_NM: 'Calvin',
                PlanNo : '4'
            },
            {
                STUDNT_NM: 'OhReally',
                PlanNo : '5'
            }
        ],
        February : [
            {
                STUDNT_NM: 'Calvin',
                PlanNo : '1'
            },
            {
                STUDNT_NM: 'OhReally',
                PlanNo : '3'
            }
        ]
    }

    console.log($scope.journalPlan['February']);

    $scope.showCreateStudentDialog = function(ev){
        $mdDialog.show(
            {
                controller: DialogController,
                templateUrl : 'html/CreateSupervision.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    userID: userID
                }
            }
        )
    };

    function DialogController(userID, $scope,$rootScope, $mdDialog) {


        $scope.types =['Undergraduate','Postgraduate'];
        
        $scope.hide = function() {
        $mdDialog.hide();
        };

        $scope.cancel = function() {
        $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
        $mdDialog.hide(answer);
        };

        $scope.submit = function(){
            
            console.log($scope.studentID);

            var supervisionReqBody = {
                studentID : $scope.studentID,
                studentName : $scope.studentName,
                studentType : $scope.studentType,
                userID : userID
            };

            console.log(supervisionReqBody);
             
             $http(
                {
                    method: 'POST',
                    url: 'http://localhost:8080/apis/supervision',
                    data : supervisionReqBody,
                    headers:{
                        'Content-Type':'application/json'
                    }
                }
            )//.then(function successCallback(response,$rootScope,$injector){
            .success(function(data){
                    
                    $scope.newSupervision = data;
                    $rootScope.$broadcast('NewUserCreated');
                    $scope.cancel();
                    
            });
    };
    };
}])
.controller('CreateSupervisionCtrl',['$scope', function($scope){
    
}]);