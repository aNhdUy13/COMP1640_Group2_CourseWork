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
// manager Category ------------------------------------------------
router.get('/addCategory',async (req, res) => {
    
    const result = await dbHandler.viewAllCategory("categories")
    res.render('manager/addCategory', {viewAllCategory: result});
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


// Sattic Dashboard ------------------------------------------------------------

router.get('/staticDashboard',async (req, res) => {
    
    const countAcademic = await dbHandler.countIdea("Academic")
    const countSupport = await dbHandler.countIdea("Support")

    const countStaffA = await dbHandler.countStaff("Academic")
    const countStaffS = await dbHandler.countStaff("Support")
    //curent year
    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");
    const yearcurr = splitCurrDate[0];

    res.render('manager/staticDashboard', {countA: countAcademic, countS: countSupport, countStaffA:countStaffA, countStaffS: countStaffS});
})

router.post('/ChooseYearStatic', async (req, res) => {
    const selectedViewType = req.body.txtSelectedViewType;

    let result;
    if (selectedViewType == "2019") {
        result = await dbHandler.viewLatestPostIdeas();
    }
    else if (selectedViewType == "2020")
    {
        result = await dbHandler.mostPopular("postIdeas");
    }
    else if (selectedViewType == "2021") {
        result = await dbHandler.mostPopular("postIdeas");
    }
    else if (selectedViewType == "2022") {
        result = await dbHandler.mostViewed("postIdeas");
    }
    else{
        result = await dbHandler.viewLatestPostIdeas();
    }

    res.render('admin/viewPopularIdeas', { viewLatestIdeas: result })
})



module.exports = router;