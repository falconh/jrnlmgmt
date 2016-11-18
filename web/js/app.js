'use strict';
angular.module('myApp',['ngMaterial','myApp.factory','ngMessages','ui.router','ngMaterialSidemenu','material.components.expansionPanels'])
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
.controller('LoginCtrl',['$scope','$state','$stateParams','$location',
    'OAuth','SharedData',
    function($scope, $state, $stateParams, $location, OAuth, SharedData){

    $scope.submit = function(){

        OAuth.getToken($scope.loginUsername,$scope.loginPassword).then(
            function successCallBack(response){

                if(response.status == 200){
                    $scope.user = response.data;
                    console.log(response.data);
                    SharedData.user = $scope.user;
                    $location.path('/general/' + SharedData.user.userID);
                }
            },
            function errorCallBack(response){

            }
        );
       
    };
}])
.controller('MainDisplayCtrl', ['$scope','$mdDialog','$rootScope','$state',
    '$stateParams','PlannedJournal','Journal','Supervision', 'SharedData',
    function($scope, $mdDialog, $rootScope, $state, $stateParams, 
        PlannedJournal, Journal, Supervision, SharedData){

    console.log(SharedData);

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

        return plannedJournals;
    };

    var addJournals = function(plannedjournals,$scope){


        var tempProcessedPlannedJournals = $scope.processedPlannedJournals;
        for(var i = 1 ; i <= 12 ; i++){
            for(var plannedjournal in tempProcessedPlannedJournals[$scope.months[i]]){
                    var tempPlaceHolder = tempProcessedPlannedJournals[$scope.months[i]][plannedjournal];
                    console.log(tempPlaceHolder);
                    tempPlaceHolder.journals = [];

                    for(var tempPlannedJournal in plannedjournals){
                        if(plannedjournals[tempPlannedJournal].plannedID == tempPlaceHolder.plannedID){
                            tempPlaceHolder.journals = plannedjournals[tempPlannedJournal].journals;
                            break;
                        }
                    }
                    
                    tempProcessedPlannedJournals[$scope.months[i]][plannedjournal] = tempPlaceHolder;
            }
        }
        return tempProcessedPlannedJournals;
    }

    $scope.callPlannedJournalsGetAPI = function(supervisionIDs){


                PlannedJournal
                .callGetAPI(supervisionIDs)
                .then(
                    function successCallBack(response){

                        if(response.status == 200){

                            console.log(response.data);

                            $scope.processedPlannedJournals = processPlannedJournals(response.data,$scope);
                            $scope.callJournalsGetAPI(supervisionIDs);
                        }
                    
                    },
                    function errorCallBack(response){

                    }
                );
    };


    $scope.callJournalsGetAPI = function(supervisionIDs){
                
                Journal
                .callGetAPI(supervisionIDs)
                .then(
                    function successCallBack(response){

                        if(response.status == 200){
                            $scope.processedPlannedJournals = addJournals(response.data,$scope);
                        }
                    
                    },
                    function errorCallBack(response){

                    }
                );
        
    }

    $scope.callSupervisionsGetAPI = function(userID){
        
        Supervision
        .callGetAPI(userID)
        .then(
            function successCallBack(response){
                
                if(response.status == 200){
                    $scope.supervisions = response.data;
                    if(response.data !== null && response.data.length > 0){

                        var supervisionIDs = [];

                        for(var supervision in $scope.supervisions){
                            supervisionIDs.push($scope.supervisions[supervision].supervisionID);
                        }
                        $scope.callPlannedJournalsGetAPI(supervisionIDs);
                    }
                }
            },
            function errorCallBack(response){

            }
        );
    };

    $rootScope.$on('NewUserCreated',function(){
        callSupervisionsGetAPI(SharedData.user.userID);
    });

    $rootScope.$on('NewJournalPlanCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

     $rootScope.$on('NewJournalCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

    

    $scope.callSupervisionsGetAPI($scope.userID);
    

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
                controller: 'CreateStudentDialogController',
                templateUrl : 'html/createSupervision.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    userID: $scope.userID
                }
            }
        )
    };

    $scope.showCreateJournalPlanDialog = function(ev, selectedMonth){
        $mdDialog.show(
            {
                controller: "CreateJournalPlanDialogController",
                templateUrl : 'html/createJournalPlan.html',
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

     $scope.showCreateNewJournalDialog = function(ev, tempPlannedID, tempSupervisionID){
        $mdDialog.show(
            {
                controller: "CreateNewJournalDialogController",
                templateUrl : 'html/createNewJournal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    plannedID : tempPlannedID,
                    supervisionID : tempSupervisionID
                }
            }
        )
    };

    $scope.showCreateNewStatusDialog = function(ev, tempPlannedID, tempJournalID, tempSupervisionID){
        $mdDialog.show(
            {
                controller: "CreateNewStatusDialogController",
                templateUrl : 'html/createNewStatus.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    plannedID : tempPlannedID,
                    supervisionID : tempSupervisionID,
                    journalID : tempJournalID
                }
            }
        )
    };


}])
.controller('CreateStudentDialogController', function(userID, Supervision, $scope, $rootScope, $mdDialog){


        $scope.types =['Undergraduate','Postgraduate','PHD'];
        console.log(Supervision);
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

            Supervision
            .callPostAPI(supervisionReqBody)
            .then(
                function successCallback(response){
                    
                    if(response.status == 201){
                        $rootScope.$broadcast('NewUserCreated');
                        $scope.cancel();
                    }
                    
                },
                function errorCallBack(response){

                }
            );
    };
    
})
.controller('CreateJournalPlanDialogController',function(PlannedJournal, supervisions, month, $scope, $rootScope, $mdDialog) {

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

            PlannedJournal
            .callPostAPI(plannedJournalReqBody)
            .then(
                function successCallBack(response){
                    
                    if(response.status == 201){
                        $rootScope.$broadcast('NewJournalPlanCreated', 
                            {
                                selectedSupervisionID: $scope.selectedStudent.supervisionID
                            });
                        $scope.cancel();
                    }
                    
                },
                function errorCallBack(response){

                }
            );
    };
})
.controller('CreateNewJournalDialogController', function(Journal, plannedID, supervisionID, $scope, $rootScope, $mdDialog){

        $scope.plannedID = plannedID;
        $scope.supervisionID = supervisionID;
        $scope.quartileRanks = [
            'Q1',
            'Q2',
            'Q3',
            'Q4'
        ];

        
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


            var newJournalReqBody = {
                journalName : $scope.journalName,
                paperName : $scope.paperName,
                authors: $scope.authors,
                quartileRank : $scope.selectedQuartileRank,
                impactFactor: $scope.impactFactor,
                plannedID : $scope.plannedID
            };

            Journal
            .callPostAPI(newJournalReqBody)
            .then(
                function successCallBack(response){
                    
                    $rootScope.$broadcast('NewJournalCreated', 
                        {
                            selectedSupervisionID: $scope.supervisionID
                        });
                    $scope.cancel();
                    
                },
                function errorCallBack(response){

                }
            );
    };
    
}).
controller('CreateNewStatusDialogController', function(plannedID, journalID, supervisionID, $scope,$rootScope, $mdDialog){

        $scope.plannedID = plannedID;
        $scope.supervisionID = supervisionID;
        $scope.journalID = journalID;
        $scope.statusList = [
            'submmitted',
            'accepted',
            'minor revision',
            'major revision',
            'rejection'
        ];

        
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


            var newJournalReqBody = {
                plannedID : $scope.plannedID,
                journalID : $scope.journalID,
                status: $scope.selectedStatus,
                proof : $scope.proof
            };

            console.log(newJournalReqBody);
             
            //  $http(
            //     {
            //         method: 'POST',
            //         url: 'http://localhost:8080/apis/journals',
            //         data : newJournalReqBody,
            //         headers:{
            //             'Content-Type':'application/json'
            //         }
            //     }
            // )//.then(function successCallback(response,$rootScope,$injector){
            // .success(function(data){
                    
            //         $rootScope.$broadcast('NewJournalCreated', 
            //             {
            //                 selectedSupervisionID: $scope.supervisionID
            //             });
            //         $scope.cancel();
                    
            // });
    };
    
});





