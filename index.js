var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var app = express();
var multer = require('multer');
var progressProofStorage = multer.diskStorage({
    destination : function(req, file, callback){
        callback(null, './progress-proof-uploads');
    },
    filename : function(req, file, callback){
        callback(null, Date.now() + "-" +  file.originalname );
    }
});

var progressProofUpload = multer({storage : progressProofStorage}).fields([
    {
        name : 'progressProof',
        maxCount : 1
    }
]);
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

var months = [
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

var Journal = sequelize.define('JRNL_TBL',{
    journalID : {
        type: Sequelize.INTEGER,
        field: 'JRNL_ID',
        primaryKey: true,
        autoIncrement: true
    },
    journalName : {
        type: Sequelize.STRING,
        field: 'JRNL_NM'
    },
    paperName : {
        type: Sequelize.STRING,
        field: 'JRNL_PPR_NM'
    },
    authors : {
        type: Sequelize.STRING,
        field: 'JRNL_ATHRS'
    },
    quartileRank : {
        type: Sequelize.STRING,
        field: 'JRNL_QRTL_RANK'
    },
    impactFactor : {
        type: Sequelize.FLOAT,
        field: 'JRNL_IMPCT_FCTOR'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'JRNL_TBL'
});

var JournalProgress = sequelize.define('JRNLPRGSS_TBL',{
    journalProgressID: {
        type: Sequelize.INTEGER,
        field: 'JRNLPRGSS_ID',
        primaryKey: true,
        autoIncrement: true
    },
    plannedID: {
        type: Sequelize.INTEGER,
        field: 'JRNLPRGSS_JRNLPLN_ID'
    },
    journalID: {
        type: Sequelize.INTEGER,
        field: 'JRNLPRGSS_JRNL_ID'
    },
    createdDate: {
        type: Sequelize.DATE,
        field: 'JRNLPRGSS_CREATED_DATE'
    },
    status: {
        type: Sequelize.STRING,
        field: 'JRNLPRGSS_STATUS'
    },
    description: {
        type: Sequelize.STRING,
        field: 'JRNLPRGSS_DSCRP'
    },
    proof: {
        type: Sequelize.INTEGER,
        field: 'JRNLPRGSS_PRF'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'JRNLPRGSS_TBL'
});

var FileMetadata = sequelize.define('FLMD_TBL', {
    fileID: {
        type: Sequelize.INTEGER,
        field: 'FLMD_ID',
        primaryKey : true,
        autoIncrement : true
    },
    fileLocation: {
        type: Sequelize.STRING,
        field: 'FLMD_LOC'
    },
    fileOriginalName: {
        type: Sequelize.STRING,
        field: 'FLMD_ORIGINALNM'
    }
},{
    timestamps: false,
    freezeTableName: true,
    tableName: 'FLMD_TBL'
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
    var user_id = req.query.userID;

    console.log(user_id);

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
    var tempjournalPlannedDate = new Date(req.body.plannedDate);
    var tempPlannedNo = req.body.plannedNumber;

    tempjournalPlannedDate.setDate(3);
    tempjournalPlannedDate.setHours(0);
    tempjournalPlannedDate.setMinutes(0);
    tempjournalPlannedDate.setSeconds(0);
    tempjournalPlannedDate.setMilliseconds(0);

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
    var tempSupervisionID = req.query.supervisionID.split(",");

    console.log(req.param.supervisionID);

    PlannedJournals.findAll({
        where:{
            supervisionID: tempSupervisionID
        }
    }).then(function(plannedjournals){
            var resStructure = {};
            
            for(var i = 0 ; i < 12 ; i++){
                resStructure[months[i]] = [];
            }

            for(var plannedjournal in plannedjournals){
                var tempMonth = new Date(plannedjournals[plannedjournal].plannedDate).getMonth();
                console.log(months[tempMonth]);
                resStructure[months[tempMonth]].push(plannedjournals[plannedjournal].get({plain: true}));
            }

            console.log(resStructure);

            res.json(resStructure);
        });
});

router.route('/journals')
.post(function(req,res){
    var tempJournalName = req.body.journalName;
    var tempPaperName = req.body.paperName;
    var tempAuthors = req.body.authors;
    var tempQuartileRank = req.body.quartileRank;
    var tempImpactFactor = req.body.impactFactor;
    var tempPlannedID = req.body.plannedID;

    Journal.findOrCreate(
        {
            where:{
                journalName : tempJournalName,
                paperName : tempPaperName,
                authors : tempAuthors 
            },
            attributes: {exclude : ['JRNL_ID']},
            defaults:{
                quartileRank : tempQuartileRank,
                impactFactor : parseFloat(tempImpactFactor)
            }
        }
    ).spread(function(journals,created){

        var tempJournals = journals.get({
                    plain: true
                });

            if(!created){

                var tempCreatedDate = new Date();

                JournalProgress.findOrCreate({
                    where:{
                        journalID: tempJournals.journalID,
                        plannedID: tempPlannedID
                    },
                    defaults:{
                        createdDate: tempCreatedDate,
                        status: "Incomplete",
                        description : "Generated status when journal was created",
                        proof: null
                    }
                }).spread(function(journalProgress,created){
                    if(!created){
                        var errorRes = {
                            error:{
                                code: '409',
                                message : 'Journal already exist'
                            }
                        };

                        res.status(409).json(errorRes);
                    }else{
                        tempJournals.progress = journalProgress;
                        res.status(201).json(tempJournals);
                    }
                });
            }else{

                var tempCreatedDate = new Date();

                JournalProgress.findOrCreate({
                    where:{
                        journalID: tempJournals.journalID,
                        plannedID: tempPlannedID
                    },
                    defaults:{
                        createdDate: tempCreatedDate,
                        status: "Incomplete",
                        description : "Status generated when journal was being created",
                        proof: null
                    }
                }).spread(function(journalProgress,created){
                    if(!created){
                        var errorRes = {
                            error:{
                                code: '500',
                                message : 'Corrupted database'
                            }
                        };

                        res.status(500).json(errorRes);
                    }else{
                        tempJournals.progress = journalProgress;
                        res.status(201).json(tempJournals);
                    }
                });
            }
    });
})
.get(function(req,res){
    var tempSupervisionID = req.query.supervisionID.split(",");

     PlannedJournals.findAll({
        where:{
            supervisionID: tempSupervisionID
        }
    }).then(function(plannedjournals){

        var tempPlannedID = [];
        for(var plannedjournal in plannedjournals){
            tempPlannedID.push(plannedjournals[plannedjournal].plannedID);
        }

        JournalProgress.findAll({
            where:{
                plannedID: tempPlannedID
            }
        }).then(function(journalProgresses){

            var journalIDs = [];

            var fileIDs = [];

            for( var journalProgress in journalProgresses ){

                if(journalIDs.indexOf(journalProgresses[journalProgress].journalID) == -1){
                    journalIDs.push(journalProgresses[journalProgress].journalID);
                }

                if(fileIDs.indexOf(journalProgresses[journalProgress].proof) == -1){
                    fileIDs.push(journalProgresses[journalProgress].proof);
                }

            }

            Journal.findAll({
                where: {
                    journalID: journalIDs
                }
            }).then(function(journals){

                FileMetadata.findAll({
                    where: {
                        fileID: fileIDs
                    }
                }).then(function(files){

                    for(var plannedjournal in plannedjournals){

                        var tempPlannedJournal = plannedjournals[plannedjournal].get({plain:true});
                        tempPlannedJournal.journals = [];
                        var tempJournalIds = [];

                        for(var journalProgress in journalProgresses){

                            var tempJournalProgress = journalProgresses[journalProgress].get({plain:true});

                            for(var file in files){
                                var tempFile = files[file].get({plan: true});
                                if(tempJournalProgress.proof == tempFile.fileID){
                                    tempJournalProgress.fileMetadata = tempFile ;
                                    break;
                                }
                            }

                            if(tempJournalProgress.plannedID == 
                                tempPlannedJournal.plannedID){
                                if(tempJournalIds.indexOf(tempJournalProgress.journalID) == -1)
                                    tempJournalIds.push(tempJournalProgress.journalID);
                            }
                        }


                        for(var tempJournalId in tempJournalIds){
                            for(var journal in journals){
                                var tempJournal = journals[journal].get({plan:true});
                                if(tempJournal.journalID == tempJournalIds[tempJournalId]){
                                    tempPlannedJournal.journals.push(tempJournal);
                                    break;
                                }
                            }
                        }

                        for( var journal in tempPlannedJournal.journals){
                            var tempJournal = tempPlannedJournal.journals[journal];
                            tempJournal.progress = [];

                            for( var journalProgress in journalProgresses){
                                var tempJournalProgress = journalProgresses[journalProgress].get({plain:true});
                                var tempDate = new Date(tempJournalProgress.createdDate);
                                tempJournalProgress.createdDate = tempDate.toString();
                                if(tempJournalProgress.plannedID == 
                                    tempPlannedJournal.plannedID &&
                                    tempJournalProgress.journalID == tempJournal.journalID){
                                    tempJournal.progress.push(tempJournalProgress);
                                }
                            }

                            tempPlannedJournal.journals[journal] = tempJournal;
                        }

                        plannedjournals[plannedjournal] = tempPlannedJournal;

                    }

                console.log(plannedjournals);
                
                res.json(plannedjournals);

                });

            });
        });
            
        });
  
});


router.route('/journals/:journalID')
.get(function(req,res){
    var tempJournalID = req.params.journalID;

    Journal.findById(parseInt(tempJournalID)).then(function(journal){
        res.json(journal);
    });
});

router.route('/journalprogress')
.post(function(req,res){
    progressProofUpload(req, res, function(err){
        if(err){

                        var errorRes = {
                            error:{
                                code: '500',
                                message : 'Failed to upload progress proof'
                            }
                        };

            res.status(500).json(errorRes);

        }else{
            var tempPlannedID = req.body.plannedID ;
            var tempJournalID = req.body.journalID ;
            var tempDescription = req.body.description ;
            var tempStatus = req.body.status;
            var tempFile = req.files['progressProof'][0];

            console.log(tempFile);

            FileMetadata
                .build({ fileLocation : tempFile.path , fileOriginalName : tempFile.originalname })
                .save()
                .then(function(createdFile){
                    JournalProgress
                        .build({ 
                            plannedID : tempPlannedID,
                            journalID : tempJournalID,
                            createdDate : new Date(),
                            description : tempDescription,
                            status : tempStatus,
                            proof : createdFile.fileID
                        })
                        .save()
                        .then(function(createdJournalProgress){
                            res.status(201).json(createdJournalProgress);
                        })
                        .catch(function(error){
                            var errorRes = {
                                error : {
                                    code : '500',
                                    message : 'Failed to create new journal progress'
                                }
                            };

                            res.status(500).json(errorRes);

                        });
                })
                .catch(function(error){
                    var errorRes = {
                        error: {
                            code : '500',
                            message : 'Failed to create new file metadata'
                        }
                    };

                    res.status(500).json(errorRes);
                });

        }


    });
});

router.route('/file/:fileID')
.get(function(req, res){
    var tempFileID = req.params.fileID;

    console.log(tempFileID);

    FileMetadata.findById(parseInt(tempFileID))
    .then(function(file){
        var tempFile = file.get({plan: true});
        console.log(__dirname + "/" + file.fileLocation)
        res.download(__dirname + "/" + file.fileLocation, file.fileOriginalName, function(error){
            if(error){
                var errorRes = {
                    error : {
                        code : '500',
                        message : 'Unable to download file from the server'
                    }
                };

                res.status(500).json(errorRes);
            }
        });
    })
    .catch(function(error){
        var errorRes = {
            error : {
                code : '404',
                message : 'File not found'
            }
        };
        console.log(error);
        res.status(404).json(errorRes);
    });
});

app.use('/apis', router);

server.listen(serverPort);
console.log("Server listening at port " + serverPort);