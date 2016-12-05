angular.module('myApp.factory',[])
.factory('PlannedJournal', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(supervisionID){

			if(!(supervisionID instanceof Array)){
				supervisionID = supervisionID.toString().split(",");
			}
			
			var supervisionList = "";

			for(var i = 0 ; i < supervisionID.length ; i++){

				if(i != 0){
					supervisionList += ",";
				}

				supervisionList += supervisionID[i];
			}

			return	$http(
	                    {
	                        method: 'GET',
	                        url: 'http://localhost:8080/apis/plannedjournals?supervisionID=' + supervisionList
	                    }
	                ).then(
	                	function successCallBack(response){

	           
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		},

		callPostAPI : function(body){

			return	$http(
	                    {
		                    method: 'POST',
		                    url: 'http://localhost:8080/apis/plannedjournals',
		                    data : body,
		                    headers:{
		                        'Content-Type':'application/json'
		                    }
		                }
	                ).then(
	                	function successCallBack(response){
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		}
	};
}])
.factory('Journal', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(supervisionID){
			

			return	$http(
						{
	                        method: 'GET',
	                        url: 'http://localhost:8080/apis/journals?supervisionID=' + supervisionID
                    	}
	                ).then(
	                	function successCallBack(response){
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		},

		callPostAPI : function(body){

			return	$http(
	                    {
		                    method: 'POST',
		                    url: 'http://localhost:8080/apis/journals',
		                    data : body,
		                    headers:{
		                        'Content-Type':'application/json'
		                    }
		                }
	                ).then(
	                	function successCallBack(response){
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		}
	};
}])
.factory('Supervision', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(userID){
			

			return	$http(
	                   {
			                method: 'GET',
			                url: 'http://localhost:8080/apis/supervision?userID=' + userID,
			            }
	                ).then(
	                	function successCallBack(response){
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		},

		callPostAPI : function(body){

			return	$http(
	                    {
		                    method: 'POST',
		                    url: 'http://localhost:8080/apis/supervision',
		                    data : body,
		                    headers:{
		                        'Content-Type':'application/json'
		                    }
		                }
	                ).then(
	                	function successCallBack(response){
	                		return response;
	                	},
	                	function errorCallback(response){
	                		return response;
	                	}
	                );
		}
	};
}])
.factory('OAuth', ['$http', '$q', function($http, $q){

	var service = {};

	service.getToken = function(tempUsername, tempPassword){
			
							var body = {
								username : tempUsername,
								password : tempPassword
							};

							return	$http(
					                   {
							                method: 'POST',
							                url: 'http://localhost:8080/apis/login',
							                data : body,
							                headers:{
							                    'Content-Type':'application/json'
							                }
							            }
					                ).then(
					                	function successCallBack(response){
					                		return response;
					                	},
					                	function errorCallback(response){
					                		return response;
					                	}
					                );
						};

	return service ;
}])
.factory('JournalProgress', ['$http', '$q', function($http, $q){
	return {
		callPostAPI : function(tempStatus, tempDescription, tempFile, tempPlannedID, tempJournalID, tempQuartileRank, tempImpactFactor){

			console.log(tempStatus, tempDescription, tempFile, tempPlannedID, tempJournalID, tempQuartileRank, tempImpactFactor);

			var fd = new FormData();
			fd.append('plannedID', tempPlannedID);
			fd.append('journalID', tempJournalID);
			fd.append('status', tempStatus);
			fd.append('description', tempDescription);
			fd.append('quartileRank', tempQuartileRank);
			fd.append('impactFactor', tempImpactFactor);
			angular.forEach(tempFile, function(obj){
				fd.append('progressProof', obj.lfFile);
			});
			var apiURL = 'http://localhost:8080/apis/journalprogress';

			console.log(fd.getAll('progressProof'));

			return $http.post(apiURL, fd, {
						transformRequest: angular.identity,
						headers: {
							'Content-Type' : undefined
						}
					}).then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('File', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(fileID){

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/apis/file/' + fileID

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('MonthlyProgress', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(userIDs){

			console.log(userIDs);

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/report/monthlyprogress?userID=' + userIDs

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('Department', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(){

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/report/departments'

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('User', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(departments){

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/report/users?department=' + departments

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('SingleUser', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(userID){

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/apis/users/' + userID

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('ReportJournal', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(userIDs){

			return $http(
						{
							method: 'GET',
							url: 'http://localhost:8080/report/journals?userID=' + userIDs

						}
					)
					.then(
						function successCallBack(response){
							return response;
						},
						function errorCallBack(response){
							return response;
						}
					);
		}
	};
}])
.factory('SharedData', function(){
	return {
		user : ''
	}
});