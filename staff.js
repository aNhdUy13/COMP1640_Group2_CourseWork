const express = require('express');
var multer = require('multer');
var app = express();
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

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
    const newDes = req.body.txtNewDescription;
    const startDate = req.body.txtStartDate;
    const result = await dbHandler.getCategory("categories");
    const endDate = req.body.txtEndDate;
    const newFile= req.body.txtFile;
        const ideas = {
            topic: newTopic,
            description: newDes,
            Category : result,
            startDate: startDate,
            endDate: endDate,
            newFile: newFile,
        }

        await dbHandler.addNewAccount("postIdea", ideas);
        res.render('staff/submit',{ viewCategory: result});
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
    
    res.render('staff/allFileSubmit',{ viewCategory: result});
})
module.exports = router;    