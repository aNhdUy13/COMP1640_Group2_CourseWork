const express = require('express');
const hbs = require('hbs');
const path = require('path');
const session = require('express-session');


const app = express();

app.set('view engine', 'hbs');

var bodyParser = require("body-parser");
//const { Console } = require('console');
app.use(bodyParser.urlencoded({ extended: false }));

const viewPath = path.join(__dirname, 'views/partial')
hbs.registerPartials(viewPath)



app.get('/', (req, res) => {
    res.render('index');
})


var adminController = require('./admin.js');
app.use('/admin', adminController);



app.use(express.static('public'));


const PORT = 12345;
app.listen(process.env.PORT || PORT);
console.log("Web is running at port " + PORT +" click: http://localhost:12345/");