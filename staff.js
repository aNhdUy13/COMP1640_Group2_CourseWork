const express = require('express');
const app = express();
const router = express.Router();
const dbHandler = require('./databaseHandler');
const { ObjectId } = require('mongodb');
const { request } = require('https');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://nguyenduyanh131201:duyanh12345678@cluster0-shard-00-00.letwt.mongodb.net:27017,cluster0-shard-00-01.letwt.mongodb.net:27017,cluster0-shard-00-02.letwt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-kl4ffn-shard-0&authSource=admin&retryWrites=true&w=majority";
const dbName = "COMP1640_Web_DBnew_2";
const formidable = require('formidable');
const fs = require('fs');

const options = {
    multiples: true,
    uploadDir: __dirname + '/uploads'
};

const form = formidable(options);

router.get('/', (req, res) => {
    if(!req.session.username)
    return res.render('login')
    res.render('staff/staffHome');
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/submit.hbs");
});

router.post('/upload',function(req,res){
    upload(req,res,function(err){
        if(err){
            return res.end('Error uploading file');
        }
        res.end('File is uploaded successfully');

    });
});

router.post('/doAddIdea',async(req, res, next) => {
    if (!req.session || !req.session.username || !req.session.user) return res.sendStatus(401);
    form.parse(req, async function (err, fields, files) {
        if (err) return res.sendStatus(500);
        //curent date
        var currDate = new Date();
        var currDate2 = currDate.toISOString().slice(0, 10);
        var splitCurrDate = currDate2.split("-");

        const newTopic = fields.txtNewTopic;
        const newDes = fields.txtNewDes;
        const category = fields.txtNameCategory;
        const username = req.session.username;
        const email = req.session.user.email;
        const uploadFiles = [];
        const likers = [];
        const dislikers = [];
        const views = 0;
        const popularpoint =0;
        const yearcurr = splitCurrDate[0];
        const department = req.session.user.department;
        if (!Array.isArray(files.uploadFiles)) files.uploadFiles = [files.uploadFiles];
        for (let file of files.uploadFiles) {
            const oldPath = file.filepath;
            const url = '/uploads/' + Date.now().toString() + '_' + file.originalFilename;
            const newPath = __dirname + '/public' + url;
            try {
                fs.renameSync(oldPath, newPath);
                uploadFiles.push({
                    fileName: file.originalFilename,
                    url: url
                });
            } catch (error) {
                console.log(error)
            };
        }
        const ideas = {
            topic: newTopic,
            description: newDes,
            category: category,
            email: email,
            users : username,
            files: uploadFiles,
            likers: likers,
            dislikers: dislikers,
            views: views,
            popularpoint: popularpoint,
            year: yearcurr,
            department: department
        }
    
    // set time check
    const result = await dbHandler.viewAllDataInTable("closureDates");

    var countDateInDB = result.length;
    console.log("Count : " + countDateInDB);

    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");
    var currDay = splitCurrDate[2];
    var currMonth = splitCurrDate[1];
    var currYear = splitCurrDate[0]
    var finalCurrDate = currMonth + "-" + currDay + "-" + currYear;

    let finalEndDate, finalStartDate, finalStartDate2, finalEndDate2;

    for (i = 0; i < countDateInDB; i++) {
        const objectDate = JSON.stringify(result[i], null, 2);
        console.log(objectDate)
        const splitDate = objectDate.split(",");
        const fullStartDate = splitDate[1];
        const fullEndDate = splitDate[2];

        // Implement Start Date
        const splitStartDate = fullStartDate.split(":");
        const startDate = splitStartDate[1];
        const startDateSlice = startDate.slice(2, 12);
        const splitStartDate2 = startDateSlice.split("-");
        const dayStartDate = splitStartDate2[0];
        const monthStartDate = splitStartDate2[1];
        const yearStartDate = splitStartDate2[2];

        // Implement End Date
        const splitEndDate = fullEndDate.split(":");
        const endDate = splitEndDate[1];
        const endDateSlice = endDate.slice(2, 12);
        const splitEndDate2 = endDateSlice.split("-");
        const dayEndDate = splitEndDate2[0];
        const monthEndDate = splitEndDate2[1];
        const yearEndDate = splitEndDate2[2];

        if (currYear == yearStartDate) {
            console.log("Found !");
            finalStartDate = monthStartDate + "-" + dayStartDate + "-" + yearStartDate;
            finalEndDate = monthEndDate + "-" + dayEndDate + "-" + yearEndDate;

            finalStartDate2 = dayStartDate + "-" + monthStartDate+ "-" + yearStartDate;
            finalEndDate2 = dayEndDate + "-" + monthEndDate + "-" + yearEndDate;
        }
        else {
            console.log("Not Found !");

        }

    }
    // Date Format : Month-Day-Year
    console.log("Start Date : " + finalStartDate);
    console.log("End Date : " + finalEndDate);
    console.log("Current Date : " + finalCurrDate);

    var formatStartDate, formatEndDate, formatCurrDate;
    formatStartDate = Date.parse(finalStartDate);
    console.log(formatStartDate);

    formatEndDate = Date.parse(finalEndDate);
    console.log(formatEndDate);

    formatCurrDate = Date.parse(finalCurrDate);
    console.log(formatCurrDate);

    var messageHere;
    if ((formatCurrDate >= formatStartDate && formatCurrDate <= formatEndDate ) )
    {
        messageHere = "File Submitted Successfully !"
        console.log(messageHere);
        await dbHandler.addNewAccount("postIdeas", ideas);

        res.render('staff/allFileSubmit', { startDate: finalStartDate2, endDate: finalEndDate2, message: messageHere, implementSuccess: "Post idea uploaded" })

    }
    else {
        messageHere = "Staff CANNOT Submit File !"
        console.log(messageHere);
        res.render('staff/allFileSubmit', { startDate: finalStartDate2, endDate: finalEndDate2, message: messageHere, implementSuccess: "Post idea Not uploaded" })

    }

    })
    

        
})

router.post('/doAddFile', async function(req, res, next) {
    if (!req.session || !req.session.username || !req.session.user) return res.sendStatus(401);
    form.parse(req, async function (err, fields, files) {
        const idea = fields.idea;
        const exists = await dbHandler.checkExists("postIdeas", idea);
        if (exists.length < 1) return res.sendStatus(404);
        const uploadFiles = [];
        if (!Array.isArray(files.uploadFiles)) files.uploadFiles = [files.uploadFiles];
        for (let file of files.uploadFiles) {
            const oldPath = file.filepath;
            const url = '/uploads/' + Date.now().toString() + '_' + file.originalFilename;
            const newPath = __dirname + '/public' + url;
            try {
                fs.renameSync(oldPath, newPath);
                uploadFiles.push({
                    fileName: file.originalFilename,
                    url: url
                });
            } catch (error) {
                console.log(error)
            };
        }
        await dbHandler.addIdeaFile("postIdeas", idea, uploadFiles);
        res.render('staff/allFileSubmit', { implementSuccess: "File added" })
    })
    
})

router.post('/doRemoveFile', async function(req, res, next) {
    if (!req.session || !req.session.username || !req.session.user) return res.status(401).json({
        success: false
    });
    const idea = req.body.idea;
    
    const exists = await dbHandler.checkExists("postIdeas", idea);
    const file = {
        fileName: req.body.fileName,
        url: req.body.fileUrl
    }
    if (exists.length < 1) return res.status(404).json({
        success: false
    });
    await dbHandler.removeIdeaFile("postIdeas", idea, file);
    return res.json({
        success: true
    })
})

router.get('/allFileSubmit',async (req, res) => {
    const result = await dbHandler.getCategory("categories");
    const getDate = await dbHandler.getCategory("closureDates");
    if(!req.session.username)
    return res.render('login');
    const newValues = await dbHandler.getUser("users",req.session.user.email);
    console.log(newValues);
    res.render('staff/allFileSubmit',{ viewCategory: result, getDate: getDate, getUser: newValues[0]});
})


// get categories

router.get('/', (req, res) => {
    if(!req.session.username)
    return res.render('login')
    res.render('staff/staffHome');
})

router.get('/submit',async (req, res) => {
    res.render('staff/submit');
})

router.get('/viewAll',async (req, res) => {
    const result = await dbHandler.viewAll("postIdeas");
    
    res.render('staff/seeIdea',{ viewAllIdea: result});

})


router.get('/allFileSubmit',async (req, res) => {
    const result = await dbHandler.getCategory("categories");

    if(!req.session.username)
    return res.render('login');
    const newValues = await dbHandler.getUser("users",req.session.user.email);
    console.log(newValues);
    res.render('staff/allFileSubmit',{ viewCategory: result, getUser: newValues[0]});
})



router.post("/do-like", async function (request, result) {
        if (!request.session.user || !request.session.user._id) return result.status(401).json({status: 'error'});
        const client = await MongoClient.connect(url);
        const dbo = client.db(dbName);
        dbo.collection("postIdeas").findOne({
            "_id": ObjectId(request.body.postId)
            }, function (error, item){
                if (item.likers === null || item.likers === undefined) {
                    dbo.collection("postIdeas").findOneAndUpdate({
                        "_id": ObjectId(request.body.postId),
                        
                    },{
                        $set: {
                            likers: [
                                { "_id": request.session.user._id }
                            ]
                        },
                        $pull: {
                            dislikers: {
                                "_id": request.session.user._id
                            }
                        }
                    },{
                        returnDocument: 'after'
                    },
                    function (error, data){
                        console.log(data);
                        return result.json({
                            "status": "success",
                            "message": "Video has been liked",
                            count: {
                                like: data.value.likers ? data.value.likers.length : 0,
                                dislike: data.value.dislikers ? data.value.dislikers.length : 0
                            }
                        });
                    });
                } else if (item.likers.find(e => e._id.toString() === request.session.user._id)) {
                    return result.json({
                        "status": "error",
                        "message": "Already liked this video"
                    });
                } else {
                    dbo.collection("postIdeas").findOneAndUpdate({
                        "_id": ObjectId(request.body.postId),
                        
                    },{
                        $push: {
                            "likers": { "_id": request.session.user._id }
                        },
                        $pull: {
                            dislikers: {
                                "_id": request.session.user._id
                            }
                        }
                    },{
                        returnDocument: 'after'
                    },
                    function (error, data){
                        console.log(data);
                        return result.json({
                            "status": "success",
                            "message": "Video has been liked",
                            count: {
                                like: data.value.likers ? data.value.likers.length : 0,
                                dislike: data.value.dislikers ? data.value.dislikers.length : 0
                            }
                        });
                    });
                }
        })

})
router.post("/do-dislike", async function (request, result) {
    if (!request.session.user || !request.session.user._id) return result.status(401).json({status: 'error'});
        const client = await MongoClient.connect(url);
        const dbo = client.db(dbName);
        dbo.collection("postIdeas").findOne({
            "_id": ObjectId(request.body.postId)
            }, function (error, item){
                if (item.dislikers === null || item.dislikers === undefined) {
                    dbo.collection("postIdeas").findOneAndUpdate({
                        "_id": ObjectId(request.body.postId),
                        
                    },{
                        $set: {
                            dislikers: [
                                { "_id": request.session.user._id }
                            ]
                        },
                        $pull: {
                            likers: {
                                "_id": request.session.user._id
                            }
                        }
                    }, {
                        returnDocument: 'after'
                    }, 
                    function (error, data){
                        return result.json({
                            "status": "success",
                            "message": "Video has been disliked",
                            count: {
                                like: data.value.likers ? data.value.likers.length : 0,
                                dislike: data.value.dislikers ? data.value.dislikers.length : 0
                            }
                        });
                    });
                } else if (item.dislikers.find(e => e._id.toString() === request.session.user._id)) {
                    return result.json({
                        "status": "error",
                        "message": "Already disliked this video"
                    });
                } else {
                    dbo.collection("postIdeas").findOneAndUpdate({
                        "_id": ObjectId(request.body.postId),
                        
                    },{
                        $push: {
                            "dislikers": { "_id": request.session.user._id }
                        },
                        $pull: {
                            likers: {
                                "_id": request.session.user._id
                            }
                        }
                    },{
                        returnDocument: 'after'
                    },
                    function (error, data){
                        return result.json({
                            "status": "success",
                            "message": "Video has been disliked",
                            count: {
                                like: data.value.likers ? data.value.likers.length : 0,
                                dislike: data.value.dislikers ? data.value.dislikers.length : 0
                            }
                        });
                    });
                }
        })
})
router.get('/viewIdea', async (req, res) => {
    const userId = req.query.id;
    // const client = await MongoClient.connect(url);
    // const dbo = client.db(dbName);
    // dbo.collection("postIdeas").findOneAndUpdate({_id: userId}, {$inc: { views: 1}});
    const detailIdea = await dbHandler.viewDetail("postIdeas", userId);
    res.render('staff/viewDetail', { 
        viewDetail: detailIdea,
        permissions: {
            canRemoveAttachment: req.session.username && (detailIdea.username === req.session.username || req.session.user.role === "Admin" || req.session.user.role === "Staff")
        }
    })
})
function htmlEntities (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

// router.get('/get-comments', async (req, res) => {
//     const result = await findComments();
//     res.json(result);
// })

//comment
router.post('/do-comment', async function(req, res) {
    if(req.session.user && req.session.user._id) {
        const client = await MongoClient.connect(url);
        const dbo = client.db(dbName);
        const content = htmlEntities(req.body.content);
        const data = await dbHandler.addComment({
            postId: req.body.postId,
            author: req.session.user._id,
            content: content,
        })
        const cmt = await dbHandler.getComments({_id: data.insertedId});
        return res.status(200).json({
            "status": "success",
            "message": "PostIdea has been commented",
            "comment": cmt[0]
        });
        
    } else {
        res.status(401).send({
            message: 'Unauthorize'
        })
    }
})



router.post('/ChoseViewType', async (req, res) => {
    const selectedViewType = req.body.txtSelectedViewType;

    let result;
    if (selectedViewType == "LatestIdeas") {
        result = await dbHandler.viewLatestPostIdeas();
    }
    else if (selectedViewType == "LatestComments")
    {

    }
    else if (selectedViewType == "MostLikeAndDislike") {

    }
    else if (selectedViewType == "MostViewed") {
        result = await dbHandler.mostViewed("postIdeas");
    }
    else{
        result = await dbHandler.viewAll("postIdeas");
    }

    res.render('staff/seeIdea', { viewAllIdea: result })
})


//
router.post('/doSubmitFileWithTime',async (req, res) =>{
    /*
        Start to process when staff click to submib button
        (Check the curr date in is in between start and end date)
    */
    const result = await dbHandler.viewAllDataInTable("closureDates");

    var countDateInDB = result.length;
    console.log("Count : " + countDateInDB);

    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");
    var currDay = splitCurrDate[2];
    var currMonth = splitCurrDate[1];
    var currYear = splitCurrDate[0]
    var finalCurrDate = currMonth + "-" + currDay + "-" + currYear;

    let finalEndDate, finalStartDate, finalStartDate2, finalEndDate2;

    for (i = 0; i < countDateInDB; i++) {
        const objectDate = JSON.stringify(result[i], null, 2);
        console.log(objectDate)
        const splitDate = objectDate.split(",");
        const fullStartDate = splitDate[1];
        const fullEndDate = splitDate[2];

        // Implement Start Date
        const splitStartDate = fullStartDate.split(":");
        const startDate = splitStartDate[1];
        const startDateSlice = startDate.slice(2, 12);
        const splitStartDate2 = startDateSlice.split("-");
        const dayStartDate = splitStartDate2[0];
        const monthStartDate = splitStartDate2[1];
        const yearStartDate = splitStartDate2[2];

        // Implement End Date
        const splitEndDate = fullEndDate.split(":");
        const endDate = splitEndDate[1];
        const endDateSlice = endDate.slice(2, 12);
        const splitEndDate2 = endDateSlice.split("-");
        const dayEndDate = splitEndDate2[0];
        const monthEndDate = splitEndDate2[1];
        const yearEndDate = splitEndDate2[2];

        if (currYear == yearStartDate) {
            console.log("Found !");
            finalStartDate = monthStartDate + "-" + dayStartDate + "-" + yearStartDate;
            finalEndDate = monthEndDate + "-" + dayEndDate + "-" + yearEndDate;

            finalStartDate2 = dayStartDate + "-" + monthStartDate+ "-" + yearStartDate;
            finalEndDate2 = dayEndDate + "-" + monthEndDate + "-" + yearEndDate;
        }
        else {
            console.log("Not Found !");

        }

    }
    // Date Format : Month-Day-Year
    console.log("Start Date : " + finalStartDate);
    console.log("End Date : " + finalEndDate);
    console.log("Current Date : " + finalCurrDate);

    var formatStartDate, formatEndDate, formatCurrDate;
    formatStartDate = Date.parse(finalStartDate);
    console.log(formatStartDate);

    formatEndDate = Date.parse(finalEndDate);
    console.log(formatEndDate);

    formatCurrDate = Date.parse(finalCurrDate);
    console.log(formatCurrDate);

    var messageHere;
    if ((formatCurrDate >= formatStartDate && formatCurrDate <= formatEndDate ) )
    {
        messageHere = "Staff CAN Submit File !"
        console.log(messageHere);
    }
    else {
        messageHere = "Staff CANNOT Submit File !"
        console.log(messageHere);
    }
    res.render('admin/allFileSubmit.hbs', { startDate: finalStartDate2, endDate: finalEndDate2, message: messageHere });
})

app.use('/uploads', express.static('uploads'));

module.exports = router;    