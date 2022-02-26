const express = require('express');
const router = express.Router();
const dbHandler = require('./databaseHandler');

router.get('/', (req, res) => {
    res.render('admin/adminHome');
})

router.get('/accountManagement',async (req, res) => {
    res.render('admin/accountManagement');

})


router.post('/doAddAccount',async(req, res) => {
    res.redirect('accountManagement');
})



module.exports = router;