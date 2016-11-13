angular.module('myApp.factory',[])
.factory('PlannedJournal', ['$http', '$q', function($http, $q){
	return {
		callGetAPI : function(supervisionID){
			

			return	$http(
	                    {
	                        method: 'GET',
	                        url: 'http://localhost:8080/apis/plannedjournals?supervisionID=' + supervisionID
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
.factory('SharedData', function(){
	return {
		user : ''
	}
});