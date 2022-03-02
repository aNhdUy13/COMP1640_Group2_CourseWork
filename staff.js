const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');
//submit file


router.get('/submit',async (req, res) => {
    res.render('staff/submit');
})
module.exports = router;