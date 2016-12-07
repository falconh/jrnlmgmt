'use strict';
angular.module('myApp',['ngMaterial','myApp.factory','ngMessages','ui.router',
    'ngMaterialSidemenu','material.components.expansionPanels', 'lfNgMdFileInput', 'chart.js'])
.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('purple',{
        'default': '800'
    })
    .accentPalette('pink');
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
.controller('MainDisplayCtrl', ['$scope', '$location', '$mdSidenav', '$mdDialog','$rootScope','$state',
    '$stateParams','PlannedJournal','Journal','Supervision', 'File', 'Department', 'User', 
    'MonthlyProgress', 'ReportJournal', 'SingleUser', 'SharedData', 
    function($scope, $location, $mdSidenav, $mdDialog, $rootScope, $state, $stateParams, 
        PlannedJournal, Journal, Supervision, File, Department, User, MonthlyProgress, ReportJournal, SingleUser, SharedData){

    console.log(SharedData);

    $scope.sideNavIsOpen = true ;

    $scope.logout = function(){
        $location.path('/login');
    }

    $scope.toggleLeft = function(){
        $scope.sideNavIsOpen = !$scope.sideNavIsOpen;
        console.log($scope.sideNavIsOpen)
    }

    $scope.userID = $stateParams.userID;

    var broadcastSuccess = function(data){
        $rootScope.supervisions = data ;
        console.log($rootScope.supervisions);
    };

    $scope.getPlannedJournalsByMonth = function(month){
        return $scope.processedPlannedJournals[(parseInt(month) + 1).toString()];
    }

    var processPlannedJournals = function(plannedJournals,$scope){
        for(var i = 0 ; i < 12 ; i++){
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

    $scope.activateProgressView = function(){
        $scope.toolbarTitle = "Journal Planning";
        $scope.viewProgress = true;
        $scope.viewDashboard = false;
    }

    $scope.activateDashboardView = function(){
        $scope.toolbarTitle = "Progress Dashboard";
        $scope.viewProgress = false;
        $scope.viewDashboard = true;
    }

    var addJournals = function(plannedjournals,$scope){


        var tempProcessedPlannedJournals = $scope.processedPlannedJournals;
        for(var i = 0 ; i < 12 ; i++){
            for(var plannedjournal in tempProcessedPlannedJournals[$scope.months[i]]){
                    var tempPlaceHolder = tempProcessedPlannedJournals[$scope.months[i]][plannedjournal];
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

    $scope.callSingleUserGetAPI = function(userID){


        SingleUser
            .callGetAPI(userID)
            .then(
                function successCallBack(response){
                    
                    if(response.status == 200){
                        $scope.selectedUser = response.data;
                    }
                },
                function errorCallBack(response){

                }
            );

    }

    $scope.callPlannedJournalsGetAPI = function(supervisionIDs){


                PlannedJournal
                .callGetAPI(supervisionIDs)
                .then(
                    function successCallBack(response){

                        if(response.status == 200){

                            $scope.processedPlannedJournals = processPlannedJournals(response.data,$scope);
                            $scope.callJournalsGetAPI(supervisionIDs);
                            console.log($scope.processedPlannedJournals);
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
        $scope.callSupervisionsGetAPI($scope.userID);
    });

    $rootScope.$on('NewJournalPlanCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

     $rootScope.$on('NewJournalCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

     $rootScope.$on('NewStatusCreated',function(event, args){
        $scope.callPlannedJournalsGetAPI(args.selectedSupervisionID);
    });

    

    $scope.callSupervisionsGetAPI($scope.userID);
    $scope.callSingleUserGetAPI($scope.userID);
    

    $scope.months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
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

    $scope.showCreateJournalPlanDialog = function(ev){
        $mdDialog.show(
            {
                controller: "CreateJournalPlanDialogController",
                templateUrl : 'html/createJournalPlan.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals:{
                    supervisions: $scope.supervisions,
                    months: $scope.months
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

    $scope.downloadProof = function(fileID){
        File.callGetAPI(fileID)
        .then(
            function successCallBack(response){


            });
    }


    //Charts
    //
    $scope.monthProgressLabels = $scope.months;
    $scope.monthProgressSeries = ['Accepted', 'Incomplete'];
    $scope.monthProgressData = [];
    $scope.monthProgressOptions = {
        title: {
            display: true,
            text: 'Monthly Progress (' + new Date().getFullYear() + ')'
        },
        legend:{
            display: true
        }
    }

    $scope.quartileRankLabels = [];
    $scope.quartileRankSeries = ['Q1', 'Q2', 'Q3', 'Q4'];
    $scope.quartileRankData = [];
    $scope.quartileRankOptions = {
        title: {
            display: true,
            text: 'Quartile Rank (' + new Date().getFullYear() + ')'
        },
        legend:{
            display: true
        }
    }

    $scope.statusLabels = [];
    $scope.statusSeries = [
            'Submitted',
            'Accepted',
            'Minor Revision',
            'Major Revision',
            'Rejection'
        ];

    $scope.statusData = [];
    $scope.statusOptions = {
        title: {
            display: true,
            text: 'Status (' + new Date().getFullYear() + ')'
        },
        legend:{
            display: true
        }
    }


    var setUpStatusWithDepartmentData = function(userIDs, labelIndex){
                            MonthlyProgress
                                .callGetAPI(userIDs, $scope.statusSeries)
                                .then(
                                    function successCallBack(response){

                                        if(response.status == 200){

                                            for(var month in $scope.months){
                                                var tempProgressMonth = response.data[$scope.months[month]];
                                                for(var progress in tempProgressMonth){

                                                    var tempProgress = tempProgressMonth[progress];
                                                    if($scope.statusSeries.indexOf(tempProgress.status) != -1){
                                                        $scope.statusData[$scope.statusSeries.indexOf(tempProgress.status)][labelIndex]++;
                                                    }
                                                }
                                            }
                

                                        }
                                    },
                                    function errorCallBack(response){

                                    }
                                );
    };

    var setUpStatusWithUserData = function(userID, labelIndex){
                            MonthlyProgress
                                .callGetAPI(userID, $scope.statusSeries)
                                .then(
                                    function successCallBack(response){


                                        if(response.status == 200){

                                            for(var month in $scope.months){
                                                var tempProgressMonth = response.data[$scope.months[month]];
                                                for(var progress in tempProgressMonth){

                                                    var tempProgress = tempProgressMonth[progress];
                                                    if($scope.statusSeries.indexOf(tempProgress.status) != -1){
                                                        $scope.statusData[$scope.statusSeries.indexOf(tempProgress.status)][labelIndex]++;
                                                    }
                                                }
                                            }
                

                                        }
                                    },
                                    function errorCallBack(response){

                                    }
                                );
    }

    var setUpQuartileRankWithDepartmentData = function(userIDs, labelIndex){

        ReportJournal
            .callGetAPI(userIDs)
            .then(
                function successCallBack(response){

                        if(response.status == 200){

                            for(var journal in response.data){
                                var tempJournal = response.data[journal];
                                for(var user in $scope.users){
                                    var tempUser = $scope.users[user];
                                    if(tempUser.userID == tempJournal.userID){
                                        $scope.quartileRankData[$scope.quartileRankSeries.indexOf(tempJournal.quartileRank)][labelIndex]++;
                                }
                            }
                            
                        }
                    
                    }
                },
                    function errorCallBack(response){

                    }

            );
    }

    var setUpQuartileRankWithUserData = function(userID, labelIndex){
        ReportJournal
            .callGetAPI(userID)
            .then(
                function successCallBack(response){

                        if(response.status == 200){

                            for(var journal in response.data){
                                var tempJournal = response.data[journal];
                                for(var user in $scope.users){
                                    var tempUser = $scope.users[user];
                                    if(tempUser.userID == tempJournal.userID){
                                        $scope.quartileRankData[$scope.quartileRankSeries.indexOf(tempJournal.quartileRank)][labelIndex]++;
                                }
                            }
                            
                        }
                    
                    }
                },
                    function errorCallBack(response){

                    }

            );

    }

    var resetStatus = function(){

        $scope.statusData = [];

        for(var i in $scope.statusSeries){
            var tempData = [];

            for(var j in $scope.statusLabels){
                tempData.push(0);
            }

            $scope.statusData.push(tempData);
        }
    }

    var resetMonthProgress = function(){
        $scope.monthProgressData = [];

        for(var i in $scope.monthProgressSeries){
            var tempData = [];

            for(var j in $scope.monthProgressLabels){
                tempData.push(0);
            }
            $scope.monthProgressData.push(tempData);
        }


    }

    var resetQuartileRank = function(){

        $scope.quartileRankData = [];

        for(var i in $scope.quartileRankSeries){
            var tempData = [];

            for(var j in $scope.quartileRankLabels){
                tempData.push(0);
            }

            $scope.quartileRankData.push(tempData);
        }
    }

    $scope.dashboardSubmit = function(){

        console.log($scope.selectedDepartment);

        if($scope.selectedDepartment == 'All'){
            $scope.callDepartmentGetAPI();
        }
        else{
            $scope.setUpDashboardByUsers($scope.selectedDepartment);
        }
    }

    $scope.callDepartmentGetAPI = function(){
        Department
            .callGetAPI()
            .then(
                function successCallBack(response){

                        console.log("1 1 1 ")

                        if(response.status == 200){

                            var departmentList = [];

                            for(var tempDepartment in response.data){
                                departmentList.push(response.data[tempDepartment].departments);
                            }

                            $scope.departments = ['All'].concat(departmentList);

                            //$scope.callUserGetAPI(departmentList);
                            $scope.setUpDashboardByDepartments(departmentList);
                        }
                    
                    },
                    function errorCallBack(response){

                    }

            );
    };

    $scope.callUserGetAPI = function(departments){
        User
            .callGetAPI(departments)
            .then(
                function successCallBack(response){

                        if(response.status == 200){

                            var userList = [];

                            $scope.users = response.data;

                            for(var tempUser in response.data){
                                userList.push(response.data[tempUser].userID);
                            }


                            $scope.callMonthlyProgressGetAPI(userList);

                        }
                    
                    },
                    function errorCallBack(response){

                    }

            )
    }

    $scope.callMonthlyProgressGetAPI = function(userIDs){
        var statusList = ['Incomplete', 'Accepted'];

        MonthlyProgress
            .callGetAPI(userIDs, statusList)
            .then(
                function successCallBack(response){

                        if(response.status == 200){

                            for(var month in $scope.months){
                                var tempProgressMonth = response.data[$scope.months[month]];
                                for(var progress in tempProgressMonth){
                                    if(tempProgressMonth[progress].status == "Incomplete"){
                                        $scope.monthProgressData[1][month]++;
                                    }
                                    else if(tempProgressMonth[progress].status == "Accepted"){
                                        $scope.monthProgressData[0][month]++;
                                    }
                                }
                            }
                        }
                    
                    },
                    function errorCallBack(response){

                    }

            );

    };

    var setUpDashboardWithDepartmentData = function(department, labelIndex){

        User
            .callGetAPI(department)
            .then(
                function successCallBack(response){
                    if(response.status == 200){

                        var userList = [];

                        for(var tempUser in response.data){
                                userList.push(response.data[tempUser].userID);
                        }

                        if(userList.length != 0){
                            setUpStatusWithDepartmentData(userList,labelIndex);
                            setUpQuartileRankWithDepartmentData(userList, labelIndex);
                        }

                    }
                },
                function errorCallBack(response){

                }

            );

    }

    $scope.setUpDashboardByDepartments = function(departments){

        $scope.statusLabels = departments ;
        $scope.quartileRankLabels = departments;

        resetStatus();
        resetQuartileRank();
        resetMonthProgress();

        $scope.callUserGetAPI(departments);

        for(var department in departments){
            setUpDashboardWithDepartmentData(departments[department], department);
        }

    }

    $scope.setUpDashboardByUsers = function(department){

        User
            .callGetAPI(department)
            .then(
                function successCallBack(response){

                    var userIDList = [];
                    var userNameList = [];

                    for(var user in response.data){
                        userIDList.push(response.data[user].userID);
                        userNameList.push(response.data[user].userName)
                    }

                    $scope.quartileRankLabels = userNameList;
                    $scope.statusLabels = userNameList;

                    resetQuartileRank();
                    resetStatus();
                    resetMonthProgress();

                    $scope.callMonthlyProgressGetAPI(userIDList);

                    for(var userID in userIDList){
                        setUpQuartileRankWithUserData(userIDList[userID], userID);
                        setUpStatusWithUserData(userIDList[userID], userID);
                    }
                }
            );

    }


    $scope.activateProgressView();

    $scope.callDepartmentGetAPI();


}])
.controller('CreateStudentDialogController', function(userID, Supervision, $scope, $rootScope, $mdDialog){


        $scope.types =['Post-Doc', 
                        'RA/RA+Student',
                        'Bright Sparks',
                        'PhD',
                        'Master by Research Student',
                        'Master by Coursework Student' ];
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
.controller('CreateJournalPlanDialogController',function(PlannedJournal, supervisions, months, $scope, $rootScope, $mdDialog, $mdToast) {

        $scope.supervisions = supervisions;
        $scope.months = months;
        
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
            tempPlannedDate.setMonth(parseInt(months.indexOf($scope.selectedMonth)));

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
                    }else{
                        console.log("Toast");
                        $mdToast.show(
                            $mdToast
                                .simple()
                                .textContent('Failed to create new journal planning')
                                .position('bottom right')
                                .hideDelay(1500)
                        );
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
                plannedID : $scope.plannedID
            };

            Journal
            .callPostAPI(newJournalReqBody)
            .then(
                function successCallBack(response){
                    
                    if(response.status == 201){

                        $rootScope.$broadcast('NewJournalCreated', 
                            {
                                selectedSupervisionID: $scope.supervisionID
                            });
                        $scope.cancel();
                    }
                    
                },
                function errorCallBack(response){

                }
            );
    };
    
}).
controller('CreateNewStatusDialogController', function(JournalProgress, plannedID, journalID, supervisionID, $scope,$rootScope, $mdDialog){


        console.log(plannedID + "," + journalID +  "," + supervisionID);
        $scope.plannedID = plannedID;
        $scope.supervisionID = supervisionID;
        $scope.journalID = journalID;
        $scope.statusList = [
            'Submitted',
            'Accepted',
            'Minor Revision',
            'Major Revision',
            'Rejection'
        ];


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


            JournalProgress
            .callPostAPI($scope.selectedStatus, $scope.description, $scope.progressProof, 
                $scope.plannedID, $scope.journalID, $scope.selectedQuartileRank, $scope.impactFactor)
            .then(
                function successCallBack(response){

                    if(response.status == 201){

                        $rootScope.$broadcast('NewStatusCreated', 
                            {
                                selectedSupervisionID: $scope.supervisionID
                            });
                        $scope.cancel();
                    }

                }
            );
            
    };
    
});





