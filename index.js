const express = require('express');
const hbs = require('hbs');
const app = express();

app.set('view engine', 'hbs');

var bodyParser = require("body-parser");
//const { Console } = require('console');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    // res.send("HEllo World");
    res.render('index');
})

const PORT = 12345;
app.listen(process.env.PORT || PORT);
console.log("Web is running at port " + PORT);