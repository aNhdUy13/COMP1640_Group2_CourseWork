
/* *
    Phan Manh Lam ( View Idea Detail )
*/
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.odeyq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_web_db3";
const { ObjectId } = require('mongodb');

/* *
    ( End ) Phan Manh Lam ( View Idea Detail )
*/
const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

const zip = require('express-easy-zip');
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
// Zip file and download ---------------------------------------------
router.use(zip());
  router.post('/doDownloadZip',async(req, res) => {
    
    const selectedCate = req.body.txtName;
    const listFileName = await dbHandler.searchFilename(selectedCate)
    let dirPath 
    let pathName
    const a = [
        //{ path: path.join(__dirname, './file'), name: 'any/path/to/file' }, //can be a file
    ]
    listFileName.forEach(item => {
        dirPath = __dirname + "/./public/uploads/"+item
        pathName = {path:dirPath,name:item}
        a.push(pathName)
    });
    res.zip({
         files: a,
         filename: selectedCate +'.zip'
     });
})
// manager Category ------------------------------------------------


router.get('/downloadCategory',async (req, res) => {
    
    const firstCate = await dbHandler.searchFirstCate()
    const nameCate = await dbHandler.searchCateName()
 
    const result = await dbHandler.viewFirstCategory("postIdeas",firstCate)
    res.render('manager/downloadCategory', {viewCategory:result,categoryList:nameCate, selectedCateg:firstCate});
})

router.post('/ChooseCategoryList', async (req, res) => {
    const selectedCate = req.body.txtSelectedCategory;
    
    const nameCate = await dbHandler.searchCateName()
    const result = await dbHandler.viewFirstCategory("postIdeas",selectedCate)
    res.render('manager/downloadCategory', {viewCategory:result,categoryList:nameCate, selectedCateg:selectedCate});
})
// Add Category
router.get('/addCategory',async (req, res) => {
    
    const result = await dbHandler.viewAllCategory("categories")
    res.render('manager/addCategory', {viewAllCategory: result});
})
router.post('/doAddCategory',async(req, res) => {
    const newCategory = req.body.txtNewCate;

    const isCategoryExist = await dbHandler.checkExistCategory(newCategory);
    if (isCategoryExist == "Name already in exists !")
    {
        console.log("Category Exist !");
        const result = await dbHandler.viewAllCategory("categories")
        res.render('manager/addCategory', {viewAllCategory: result, errorName: "Category Already Exist !"});

    }
    else{
        if( newCategory.trim().length == 0 ){
            const result = await dbHandler.viewAllCategory("categories")
            res.render('manager/addCategory', {viewAllCategory: result, errorName: "Error : Category Name Cannot be Null !"});
        }
        else{
            
            console.log("Start add Category !");
            const categoryData = {
                name: newCategory
            }
    
            await dbHandler.addNewAccount("categories", categoryData);
            const result = await dbHandler.viewAllCategory("categories")
            res.render('manager/addCategory', { implementSuccess: "New Account Added Successfully !",  viewAllCategory: result})
        }
    }

        
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


/* ===================================== Related "View Popular Ideas" Page ============================================= */
router.get('/viewPopularIdeas', async (req, res) => {
    result = await dbHandler.viewAllDataInTable("postIdeas");

    res.render('manager/viewPopularIdeas', { viewLatestIdeas: result})
})

router.post('/ChoseViewTypePopularIdeas', async (req, res) => {
    const selectedViewType = req.body.txtSelectedViewType;

    let result;
    if (selectedViewType == "LatestIdeas") {
        result = await dbHandler.viewLatestPostIdeas();
    }
    else if (selectedViewType == "MostLikeAndDislike") {
        await dbHandler.updatePopularPoint()
        result = await dbHandler.mostPopular("postIdeas");
    }
    else if (selectedViewType == "MostViewed") {
        result = await dbHandler.mostViewed("postIdeas");
    }
    else{
        result = await dbHandler.viewLatestPostIdeas();
    }

    res.render('manager/viewPopularIdeas', { viewLatestIdeas: result })
})


/* *
    View Idea Detail ( Manh Lam )
*/ 

    router.get('/viewIdea', async (req, res) => {
        const client = await MongoClient.connect(url);
        const dbo = client.db(dbName);
        const postIdeaId = ObjectId(req.query.id);
        const condition = { "_id": postIdeaId };
        await dbo.collection('postIdeas').updateOne(condition, { $inc: { 'views': 1 } });
        const filter = {
            _id: postIdeaId
        }
        const detailIdea = await dbHandler.getIdeas(filter);
        res.render('manager/viewDetail', {
            viewDetail: detailIdea[0],
            permissions: {
                canRemoveAttachment: req.session.username && (detailIdea.username === req.session.username || req.session.user.role === "Manager" || req.session.user.role === "Staff")
            }
        })
    })
    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
    }

    // router.get('/get-comments', async (req, res) => {
    //     const result = await findComments();
    //     res.json(result);
    // })

/* *
    ( End ) View Idea Detail ( Manh Lam )
*/ 
/* ================================================================================== */


module.exports = router;