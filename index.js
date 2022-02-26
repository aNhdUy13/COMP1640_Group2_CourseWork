const express = require('express');
const hbs = require('hbs');
const path = require('path');
const app = express();

app.set('view engine', 'hbs');

var bodyParser = require("body-parser");
//const { Console } = require('console');
app.use(bodyParser.urlencoded({ extended: false }));

const viewPath = path.join(__dirname, 'views/partial')
hbs.registerPartials(viewPath)


app.get('/', (req, res) => {
    // res.send("HEllo World");
    res.render('index');
})






app.use(express.static('public'));


const PORT = 12345;
app.listen(process.env.PORT || PORT);
console.log("Web is running at port " + PORT);