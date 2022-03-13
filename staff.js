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

router.get('/', (req, res) => {
    res.render('staff/staffHome');
})

router.get('/submit',async (req, res) => {
    res.render('staff/submit');
})
router.get('/viewAll', async (req, res) => {
    const result = await dbHandler.viewAll("postIdeas")
    res.render('staff/seeIdea',{viewAllIdea: result});
})
module.exports = router;    