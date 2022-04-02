const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

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
    if(!req.session.username)
    return res.render('login')
    res.render('manager/managerHome');
})

router.get('/addCategory',async (req, res) => {
    
    const result = await dbHandler.viewAllCategory("categories")
    res.render('manager/addCategory', {viewAllCategory: result});
})

router.get('/staticDashboard',async (req, res) => {
    
    const countAcademic = await dbHandler.countIdea("Academic")
    const countSupport = await dbHandler.countIdea("Support")
    res.render('manager/staticDashboard', {countA: countAcademic, countS: countSupport});
})

router.post('/doAddCategory',async(req, res) => {
    const newCategory = req.body.txtNewCate;

        const categoryData = {
            name: newCategory
        }

        await dbHandler.addNewAccount("categories", categoryData);
        const result = await dbHandler.viewAllCategory("categories")
        res.render('manager/addCategory', { implementSuccess: "New Account Added Successfully !",  viewAllCategory: result})
})

router.get('/deleteCategory',async function (req, res) {

    const categoryId = req.query.id;

    await dbHandler.deleteFunction("categories", categoryId);
    res.redirect('addCategory')

})
module.exports = router;