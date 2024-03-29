const express = require('express');
const hbs = require('hbs');
const path = require('path');
const session = require('express-session');


const app = express();

app.set('view engine', 'hbs');

var bodyParser = require("body-parser");
//const { Console } = require('console');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    resave: true,
    saveUninitialized:true,
    secret:'group2huhuhu',
    cookie:{maxAge:3600000}
}))
const viewPath = path.join(__dirname, 'views/partial')
hbs.registerPartials(viewPath)
hbs.registerHelper('ifCond', function(value1, value2, options) {
    if (value1 == value2) return options.fn(this);
    else return options.inverse(this);
});


var loginController = require('./login.js');
app.use('/', loginController)


app.get('/home', (req, res) => {
    res.render('index');
})

var managerController = require('./manager.js');
app.use('/manager', managerController);

var coordinatorController = require('./coordinator.js');
app.use('/coordinator', coordinatorController);

var staffController = require('./staff.js');
app.use('/staff', staffController);


var adminController = require('./admin.js');
app.use('/admin', adminController);

app.use(express.static('public'));


const PORT = 12345;
app.listen(process.env.PORT || PORT);
console.log("Web is running at port " + PORT +" click: http://localhost:12345/");