'use strict';
angular.module('myApp',['ngMaterial','ngMessages','ui.router','ngMaterialSidemenu'])
.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('orange');
})
.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider){
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
            url : '/general',
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
.controller('LoginCtrl',['$scope','$state', function($scope,$state){

    $scope.login = {
        username : '1234'
    };

    $scope.submit = function(){
        $state.go('mainProfile');
    };
}])
.controller('MainDisplayCtrl', ['$scope','$mdDialog', function($scope,$mdDialog){
    $scope.students = [
        {
            STUDNT_ID : '1234',
            STUDNT_NM : 'Calvin',
            STUDNT_TYP: 'UNDERGRADUATE'
        },
        {
            STUDNT_ID : '1235',
            STUDNT_NM : 'OH REALLY',
            STUDNT_TYP: 'UNDERGRADUATE'
        },
        {
            STUDNT_ID : '1236',
            STUDNT_NM : 'OH YEA',
            STUDNT_TYP: 'POSTGRADUATE'
        }
    ];

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
                clickOutsideToClose: true
            }
        )
    };

    function DialogController($scope, $mdDialog) {

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
    }
}])
.controller('CreateSupervisionCtrl',['$scope', function($scope){
    
}]);