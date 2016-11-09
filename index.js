var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var app = express();
var router = express.Router(); 
var server = require('http').Server(app);
var serverPort = 8080 ;
var mysql = require('mysql');
var sequelize = new Sequelize('jrnlmgmt', 'root', 'TestUser123', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
var connection = mysql.createConnection(
	{
		host		: 'localhost',
		user 		: 'root',
		password	: 'TestUser123',
		database	: 'jrnlmgmt'
	});

   app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname + '/web') //where your static content is located in your filesystem
    );


var PlannedJournals = sequelize.define('JRNLPLN_TBL',{
    plannedID : {
        type: Sequelize.INTEGER,
        field: 'JRNLPLN_ID',
        primaryKey: true,
        autoIncrement: true
    },
    supervisionID: {
        type: Sequelize.INTEGER,
        field: 'JRNLPLN_SPRVISE_ID',
        unique : 'compositeIndex'
    },
    plannedNoJournal : {
        type: Sequelize.INTEGER,
        field: 'JRNLPLN_NO_JRNL'
    },
    plannedDate:{
        type: Sequelize.DATE,
        field: 'JRNLPLN_DATE',
        unique : 'compositeIndex'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'JRNLPLN_TBL'

});

var User = sequelize.define('USR_TBL', {
    userID : {
        type : Sequelize.INTEGER,
        field : 'USR_ID',
        primaryKey: true
    },
    userUsername:{
        type : Sequelize.STRING,
        field: 'USR_USRNM'
    },
    userPassword:{
        type: Sequelize.STRING,
        field: 'USR_PASSWD'
    },
    userDepartment:{
        type: Sequelize.STRING,
        field: 'USR_DEPTMNT'
    },
    userRole:{
        type: Sequelize.INTEGER,
        field: 'USR_ROLE'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'USR_TBL'
});

var Supervision = sequelize.define('SPRVISE_TBL', {
    supervisionID : {
        type: Sequelize.INTEGER,
        field: 'SPRVISE_ID',
        primaryKey: true,
        autoIncrement: true
    },
    userID: {
        type: Sequelize.INTEGER,
        field: 'SPRVISE_USR_ID'
    },
    studentID:{
        type: Sequelize.INTEGER,
        field: 'SPRVISE_STDNT_ID'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'SPRVISE_TBL'
});

var Student = sequelize.define('STUDNT_TBL',{
    studentID : {
        type: Sequelize.INTEGER,
        field: 'STUDNT_ID',
        primaryKey: true
    },
    studentName : {
        type: Sequelize.STRING,
        field: 'STUDNT_NM'
    },
    studentType : {
        type: Sequelize.STRING,
        field: 'STUDNT_TYP'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'STUDNT_TBL'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.route('/login').post(function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({
        where: {
            userUsername: username,
            userPassword: password
        },
    }).then(function(user){

        var errorRes = {
            error:{
                code: '401',
                message: 'Unauthorized'
            }
        }

        if(user == null){
            res.status(401).json(errorRes);
        }else{
            res.json(user);
        }
    });
});

router.route('/supervision')
.get(function(req, res){
    var user_id = req.param('userID');

    if(user_id == null || user_id == ""){
        var errorRes = {
            error:{
                code: '400',
                message: 'missing mandatory parameter'
            }
        };
        res.status(400).json(errorRes);
    }

    Supervision.findAll({
        where : {
            userID : user_id
        },
        attributes: {exclude : ['id']}
    }).then(function(supervisions){

        console.log(supervisions.length);

        if(supervisions != null && supervisions.length != 0){

            var studentIds = [];

            for(var supervision in supervisions){
                console.log(supervisions[supervision].studentID);
                studentIds.push(supervisions[supervision].studentID);
            }

            console.log(studentIds);
            Student.findAll({
                where : {
                    studentID : studentIds
                }
            }).then(function(students){
                var resStructure = [];

                for(var supervision in supervisions){
                    for(var student in students){
                        if(students[student].studentID === supervisions[supervision].studentID){
                            var tempResStructure = {
                                supervisionID : supervisions[supervision].supervisionID,
                                userID : supervisions[supervision].userID,
                                student: students[student]
                            }
                            
                            resStructure.push(tempResStructure);
                        }
                    }
                }

                res.json(resStructure);
                
            });
        }else{
            res.json({});
        }
    });

})
.post(function(req, res){
    var tempStudentID = req.body.studentID;
    var tempStudentName = req.body.studentName;
    var tempStudentType = req.body.studentType;
    var tempUserID = req.body.userID;

    Student.findOrCreate({
        where: {
            studentID : tempStudentID
        },
        defaults:{
            studentName : tempStudentName,
            studentType : tempStudentType
        },
        attributes: {exclude : ['id']}
    }).spread(function(student,created){
        var tempStudent = student.get({
            plain: true
        });

        Supervision.findOrCreate({
            where:{
                studentID: tempStudent.studentID,
                userID : tempUserID
            },
            defaults:{
                studentID: tempStudent.studentID,
                userID : tempUserID
            }
        }).spread(function(supervision, created){
            if(!created){
                var errorRes = {
                    error:{
                        code: '409',
                        message : 'Supervision already exist'
                    }
                };
                res.status(409).json(errorRes);
            }else{
                res.status(201).json(supervision);
            }

        });
    });
});

router.route('/plannedjournals')
.post(function(req, res){
    var tempSupervisionID = req.body.supervisionID;
    var tempjournalPlannedDate = req.body.plannedDate;
    var tempPlannedNo = req.body.plannedNumber;

    console.log(req.body);

    PlannedJournals.findOrCreate({
        where:{
            supervisionID: tempSupervisionID,
            plannedDate : tempjournalPlannedDate
        },
        defaults:{
            plannedNoJournal: parseInt(tempPlannedNo)
        }
    }).spread(function(plannedjournals, created){
            if(!created){
                var errorRes = {
                    error:{
                        code: '409',
                        message : 'Plannedjournals already exist'
                    }
                };

                res.status(409).json(errorRes);
            }else{
                res.status(201).json(plannedjournals);
            }

        });
    
})
.get(function(req, res){
    var tempSupervisionID = req.query.supervisionID;

    console.log(req.param.supervisionID);

    PlannedJournals.findAll({
        where:{
            supervisionID: tempSupervisionID
        }}
        ).then(function(plannedjournals){
            var resStructure = {};
            
            for(var i = 1 ; i <= 12 ; i++){
                resStructure[i.toString()] = [];
            }

            for(var plannedjournal in plannedjournals){
                var tempMonth = new Date(plannedjournals[plannedjournal].plannedDate).getMonth();
                resStructure[(tempMonth + 1).toString()].push(plannedjournals[plannedjournal]);
            }

            res.json(resStructure);
        });
});



app.use('/apis', router);

server.listen(serverPort);
console.log("Server listening at port " + serverPort);