const express = require('express');
var multer = require('multer');
var app = express();
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');
const { ObjectId } = require('mongodb');
const { request } = require('https');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.letwt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_Web_DBnew_2";


router.use(session({
    resave:true,
    saveUninitialized:true,
    secret:'group2huhuhu',
    cookie:{maxAge:3600000}
}))

router.get('/', (req, res) => {
    if(!req.session.username)
    return res.render('login')
    res.render('staff/staffHome');
})



//submit file
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});


var upload = multer({ storage: storage }).single('myfile'); 

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

router.post('/doAddFile',async(req, res) => {
    const newTopic = req.body.txtNewTopic;
    const newDes = req.body.txtNewDes;
    const liker = req.body.arrLiker;
    const disliker = req.body.arrDisLiker;
    const category = req.body.txtNameCategory;
    const username = req.body.txtNameUser;
    const email = req.body.txtEmail;
    const file = req.body.txtNewFile;

    // const userName = ?
    // const userEmail = ?

        const ideas = {
            topic: newTopic,
            description: newDes,
            category: category,
            likers: liker,
            disliker: disliker,
            email: email,
            username : username,
            file: file,
        }

        await dbHandler.addNewAccount("postIdeas", ideas);
        // res.render('staff/submit',{ viewCategory: result});
        res.render('staff/allFileSubmit', { implementSuccess: "Post idea uploaded" })
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

router.get('/mostViewedIdeas',async (req, res) => {
    const result = await dbHandler.mostViewed("postIdeas");
    
    res.render('staff/mostViewed',{ mostViewed: result});

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
    var detailIdea = await dbHandler.viewDetail("postIdeas", userId);
    res.render('staff/viewDetail', { viewDetail: detailIdea })
})

app.use('/uploads', express.static('uploads'));

module.exports = router;    