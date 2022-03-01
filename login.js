const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.3vt1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_Project";


// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');

// session middle ware
router.use(session({
    resave:true,
    saveUninitialized:true,
    secret:'group2huhuhu',
    cookie:{maxAge:3600000}
}))

router.get('/', (req, res) => {
    res.render('login');
}) 

/*
    const originalPassword = "123456";
    const password = "123456";

    // Hash password & display in the system
    const hashPassword = await bcrypt.hash(originalPassword, 10);
    console.log(hashPassword);

    // Compare the PASSWORD with HASH PASSWORD & Display in the system
    const compare = await bcrypt.compare(password, hashPassword);
    console.log(compare);
*/

async function checkUser(username, password) {



    //...
}
router.post('/doLogin', async(req, res) => {
    var nameInput = req.body.txtUser;
    var passInput = req.body.txtPassword;

    // const found = await dbHandler.checkUser(nameInput, passInput);
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    const results = await dbo.collection("users").
        findOne({ $and: [{ email: nameInput }] });


    if (results != null) {
        var findEmail = await dbHandler.emailFinding(nameInput);
        req.session.username = nameInput;
        req.session.user = findEmail[0];

        const hashPassword = findEmail[0].password;

        // Compare password with hash
        const match = await bcrypt.compare(passInput, hashPassword);

        if (match) {
            if (findEmail[0].role == "Quality Assurance Manager") {
                res.render('manager/managerHome')
            } else if (findEmail[0].role == "Quality Assurance Coordinator") {
                res.render('coordinator/coordinatorHome')
            } else if (findEmail[0].role == "Staff") {
                res.render('staff/staffHome')
            } else if (findEmail[0].role == "Admin") {
                res.render('admin/adminHome')
            }
            else{
                res.render('login');
            }
        }
        else {
            res.render('login');
        }
    }
    else {
        res.render('login');
    }


    // if (found) {
    //     var findEmail = await dbHandler.emailFinding(nameInput);
    //     req.session.username=nameInput;
    //     req.session.user = findEmail[0];
        
    //     if (findEmail[0].role == "Quality Assurance Manager") {
    //         res.render('manager/managerHome')
    //     } else if (findEmail[0].role == "Quality Assurance Coordinator") {
    //         res.render('coordinator/coordinatorHome')
    //     } else if (findEmail[0].role == "Staff") {
    //         res.render('staff/staffHome')
    //     } else if (findEmail[0].role == "Admin") {
    //         res.render('admin/adminHome')
    //     }
    //     //het phan role
    // } else {
    //     res.render('login');
    // }
})


module.exports = router;
