const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');
const { Console } = require('console');

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

router.get('/downloadCategory',async (req, res) => {
    
    const firstCate = await dbHandler.searchFirstCate()
    const nameCate = await dbHandler.searchCateName()
 
    const result = await dbHandler.viewFirstCategory("postIdeas",firstCate)
    res.render('manager/downloadCategory', {viewCategory:result,categoryList:nameCate});
})

router.post('/ChooseCategoryList', async (req, res) => {
    const selectedCate = req.body.txtSelectedCategory;
    
    const nameCate = await dbHandler.searchCateName()
    const result = await dbHandler.viewFirstCategory("postIdeas",selectedCate)
    res.render('manager/downloadCategory', {viewCategory:result,categoryList:nameCate});
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
    //curent year
    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");
    const yearcurr = splitCurrDate[0];


    const countAcademic = await dbHandler.countIdea("Academic",yearcurr)
    const countSupport = await dbHandler.countIdea("Support",yearcurr)

    const countStaffA = await dbHandler.countStaff("Academic",yearcurr)
    const countStaffS = await dbHandler.countStaff("Support",yearcurr)

    const yearList = await dbHandler.findYear() 
    res.render('manager/staticDashboard', {countA: countAcademic, countS: countSupport, 
        countStaffA:countStaffA, countStaffS: countStaffS, yearList: yearList, thisYear:yearcurr});
})

router.post('/ChooseYearStatic', async (req, res) => {
    const selectedYear = req.body.txtSelectedYear;

    const countAcademic = await dbHandler.countIdea("Academic",selectedYear)
    const countSupport = await dbHandler.countIdea("Support",selectedYear)

    const countStaffA = await dbHandler.countStaff("Academic",selectedYear)
    const countStaffS = await dbHandler.countStaff("Support",selectedYear)

    const yearList = await dbHandler.findYear() 

    res.render('manager/staticDashboard', {countA: countAcademic, countS: countSupport, 
        countStaffA:countStaffA, countStaffS: countStaffS, yearList: yearList, thisYear:selectedYear});
})



module.exports = router;