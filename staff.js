const express = require('express');
var multer = require('multer');
var app = express();
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');
const { ObjectId } = require('mongodb');
const { request } = require('https');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.3vt1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_Project";


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
    const startDate = req.body.txtStartDat;
    const endDate = req.body.txtEndDate;
    const category = req.body.txtNameCategory;
    const userName = req.body.txtUserName;
    const file = req.body.txtNewFile;

    // const userName = ?
    // const userEmail = ?

        const ideas = {
            topic: newTopic,
            description: newDes,
            category: category,
            startDate: startDate,
            endDate: endDate,
            userName: userName,
            file: file,
        }

        await dbHandler.addNewAccount("postIdeas", ideas);
        // res.render('staff/submit',{ viewCategory: result});
        res.render('staff/submit', { implementSuccess: "Post idea uploaded" })
})

// get categories

router.get('/', (req, res) => {
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
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    await dbo.collection("postIdeas").findOne({
            "_id": ObjectId(request.body.userId),
            "likes._id": request.session.viewerId
        }, function (error, item){
            if(item == null){
                //push likes in array
                dbo.collection("postIdeas").updateOne({
                    "_id": ObjectId(request.body.userId)
                },{
                    $push: {
                        "likes": {
                            "_id": request.session.viewerId
                        }
                    }
                },function (error,data){
                    result.json({
                        "status": "success",
                        "message": "Video has been liked"
                    });
                });
            }else{
                result.json({
                    "status": "error",
                    "message": "Already liked this video"
                });
            }
    })
})
router.post("/do-dislike", async function (request, result) {
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    await dbo.collection("postIdeas").findOne({
            "_id": ObjectId(request.body.userId),
            "dislikes._id": request.session.viewerId
        }, function (error, item){
            if(item == null){
                //push dislikes in array
                dbo.collection("postIdeas").updateOne({
                    "_id": ObjectId(request.body.userId)
                },{
                    $push: {
                        "dislikes": {
                            "_id": request.session.viewerId
                        }
                    }
                },function (error,data){
                    result.json({
                        "status": "success",
                        "message": "Video has been disliked"
                    });
                });
            }else{
                result.json({
                    "status": "error",
                    "message": "Already disliked this video"
                });
            }
    })
})
module.exports = router;    