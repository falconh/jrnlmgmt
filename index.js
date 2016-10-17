var express = require('express');
var app = express();
var server = require('http').Server(app);
var serverPort = 8000 ;
var mysql = require('mysql');
var connection = mysql.createConnection(
	{
		host		: 'localhost',
		user 		: 'root',
		password	: 'falcon',
		database	: 'pleasantjourney'
	});

   app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname + '/web') //where your static content is located in your filesystem
    );

server.listen(serverPort);
console.log("Server listening at port " + serverPort);