const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

router.set('view engine', 'hbs');

var bodyParser = require("body-parser");
//const { Console } = require('console');
router.use(bodyParser.urlencoded({ extended: false }));

const viewPath = path.join(__dirname, 'views/partial')
hbs.registerPartials(viewPath)

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
router.post('/doLogin', async(req, res) => {
    var nameInput = req.body.txtUser;
    var passInput = req.body.txtPassword;
    const found = await dbHandler.checkUser(nameInput, passInput);
    if (found) {
        var findEmail = await dbHandler.emailFinding(nameInput);
        req.session.username=nameInput;
        req.session.user = findEmail[0];
        
        
        if (findEmail[0].role == "Quality Assurance Manager") {
            res.render('manager/managerHome')
        } else if (findEmail[0].role == "Quality Assurance Coordinator") {
            res.render('coordinator/coordinatorHome')
        } else if (findEmail[0].role == "Staff") {
            res.render('staff/staffHome')
        } else if (findEmail[0].role == "Admin") {
            res.render('admin/adminHome')
        }
        //het phan role
    } else {
        res.render('login')
    }
})


module.exports = router;
