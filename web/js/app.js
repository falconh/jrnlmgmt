'use strict';
angular.module('myApp',['ngMaterial','ngMessages','ui.router','ngMaterialSidemenu','material.components.expansionPanels'])
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

    $scope.userID = $stateParams.userID;

    var broadcastSuccess = function(data){
        $rootScope.supervisions = data ;
        console.log($rootScope.supervisions);
    };

    $scope.getPlannedJournalsByMonth = function(month){
        return $scope.processedPlannedJournals[(parseInt(month) + 1).toString()];
    }

    var processPlannedJournals = function(plannedJournals,$scope){
        for(var i = 1 ; i <= 12 ; i++){
            for(var plannedjournal in plannedJournals[$scope.months[i]]){
                for(var supervision in $scope.supervisions){
                    if($scope.supervisions[supervision].supervisionID == plannedJournals[$scope.months[i]][plannedjournal].supervisionID){
                        plannedJournals[$scope.months[i]][plannedjournal].student = $scope.supervisions[supervision].student;
                        break;
                    }
                }
            }
        }

        console.log(plannedJournals);

        return plannedJournals;
    };

    $scope.callPlannedJournalsGetAPI = function(supervisionID){

            console.log('callPlannedJournalsGetAPI : ' + supervisionID);
                $http(
                    {
                        method: 'GET',
                        url: 'http://localhost:8080/apis/plannedjournals?supervisionID=' + supervisionID
                    }
                )
                .success(function(data){

                    $scope.processedPlannedJournals = processPlannedJournals(data,$scope);
                    
                });
    };

    $scope.callSupervisionsGetAPI = function(userID){
        $http(
            {
                method: 'GET',
                url: 'http://localhost:8080/apis/supervision?userID=' + userID,
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                
                $scope.supervisions = data;
        });
    };

    $rootScope.$on('NewUserCreated',function(){
        $http(
            {
                method: 'GET',
                url: 'http://localhost:8080/apis/supervision?userID=' + $scope.userID,
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                
                $scope.supervisions = data;
        });
    });

    $rootScope.$on('NewJournalPlanCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

    $http(
            {
                method: 'GET',
                url: 'http://localhost:8080/apis/supervision?userID=' + $scope.userID
            }
        )//.then(function successCallback(response,$rootScope,$injector){
        .success(function(data){
                console.log($scope.userID);
                $scope.supervisions = data;
                if(data !== null && data.length > 0){
                    $scope.callPlannedJournalsGetAPI($scope.supervisions[0].supervisionID);
                }
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

    $scope.showCreateStudentDialog = function(ev){
        $mdDialog.show(
            {
                controller: CreateStudentDialogController,
                templateUrl : 'html/CreateSupervision.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    userID: $scope.userID
                }
            }
        )
    };

    function CreateStudentDialogController(userID, $scope,$rootScope, $mdDialog) {


        $scope.types =['Undergraduate','Postgraduate','PHD'];
        $scope.userID = userID;
        
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
                userID : $scope.userID
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

    $scope.showCreateJournalPlanDialog = function(ev, selectedMonth){
        $mdDialog.show(
            {
                controller: CreateJournalPlanDialogController,
                templateUrl : 'html/CreateJournalPlan.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    supervisions: $scope.supervisions,
                    month: selectedMonth
                }
            }
        )
    };

    function CreateJournalPlanDialogController(supervisions,month, $scope,$rootScope, $mdDialog) {

        $scope.supervisions = supervisions;
        
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

            var tempPlannedDate = new Date();
            tempPlannedDate.setMonth(parseInt(month)-1);

            var plannedJournalReqBody = {
                supervisionID : $scope.selectedStudent.supervisionID,
                plannedDate : tempPlannedDate,
                plannedNumber: $scope.noOfJournal
            };

            console.log(plannedJournalReqBody);
             
             $http(
                {
                    method: 'POST',
                    url: 'http://localhost:8080/apis/plannedjournals',
                    data : plannedJournalReqBody,
                    headers:{
                        'Content-Type':'application/json'
                    }
                }
            )//.then(function successCallback(response,$rootScope,$injector){
            .success(function(data){
                    
                    $rootScope.$broadcast('NewJournalPlanCreated', 
                        {
                            selectedSupervisionID: $scope.selectedStudent.supervisionID
                        });
                    $scope.cancel();
                    
            });
    };
    };

}])
.controller('CreateSupervisionCtrl',['$scope', function($scope){
    
}]);