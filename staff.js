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
            year: yearcurr
        }
        await dbHandler.addNewAccount("postIdeas", ideas);
        res.render('staff/allFileSubmit', { implementSuccess: "Post idea uploaded" })
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
    if(!req.session.username)
    return res.render('login');
    const newValues = await dbHandler.getUser("users",req.session.user.email);
    console.log(newValues);
    res.render('staff/allFileSubmit',{ viewCategory: result, getUser: newValues[0]});
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
        


        // dbo.collection("users").find({
    //     "accessToken": accessToken
    // }, function (error, user){
    //     if (user = null) {
    //         result.json({
    //             "status": "error",
    //             "message": "User has been logged out. Please log in again. "
    //         });
    //     }else {
    //         dbo.collection("postIdeas").find({
    //             "_id": ObjectId(_id)
    //         }, function (err, post){
    //             if (post == null) {
    //                 result.json({
    //                     "status": "error",
    //                     "message": "Post does not exist."
    //                 });
    //             }else{
    //                 var isLiked = false;
    //                 for (var a = 0; a < post.likers.length; a++){
    //                     var liker = post.likers[a];

    //                     if (liker._id.toString() == user._id.toString()) {
    //                         isLiked = true;
    //                         break;
    //                     }
    //                 }
    //             if(isLiked){
    //                 dbo.collection("postIdeas").updateOne({
    //                     "_id": ObjectId(_id)
    //                 },{
    //                     $pull: {
    //                         "likers": {
    //                             "_id": user._id,
    //                         }
    //                     }
    //                 }, function(error, data){
    //                     dbo.collection("users").updateOne({
    //                         $and: [{
    //                             "_id": post.user._id,
    //                         },{
    //                             "postIdeas._id": post._id
    //                         }]
    //                     },{
    //                         $pull: {
    //                             "postIdeas.$[].likers": {
    //                                 "_id": user._id,
    //                             }
    //                         }
    //                     });
    //                     result.json({
    //                         "status": "unliked",
    //                         "message": "Post has been unliked."
    //                     });
    //                 });
    //             } else{
    //                 dbo.collection("postIdeas").updateOne({
    //                     "_id": ObjectId(_id)
    //                 },{
    //                     $push:{
    //                         "likers": {
    //                             "_id" : user._id,
    //                             "name": user.name,
                                
    //                         }
    //                     }
    //                 }, function(error, data) {
    //                     dbo.collection("users").updateOne({
    //                         $and: [{
    //                             "_id" : post.user._id
    //                         },{
    //                             "posts._id" : post._id
    //                         }]
    //                     },{
    //                         $push:{
    //                             "postIdeas.$[].likers":{
    //                                 "_id" : user._id,
    //                                 "name": user.name,

    //                             }
    //                         }
    //                     });
    //                     result.json({
    //                         "status": "success",
    //                         "message": "Post has been liked."
    //                     })
    //                 })
    //             }
    //             }
    //         })
    //     }
    // })

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
//comment
router.post('/do-comment', async function(req, res) {
    if(req.session.user_id){
        getUser(req.session.user_id, function(user){
            dbo.collection("postIdeas").findOneAndUpdate({
                "_id": ObjectId(req.body.postId)
            },{
                $push:{
                    "comment" :{
                        "_id": request.session.user._id
                    }
                },
                $pull: {
                    commenter: {
                        "_id": request.session.user._id
                    }
                }
            }, function(error,data){
                //send notification to publisher
                return result.json({
                    "status": "success",
                    "message": "PostIdea has been commented",
                });
            })
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

app.use('/uploads', express.static('uploads'));

module.exports = router;    