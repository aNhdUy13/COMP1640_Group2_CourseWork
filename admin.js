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

// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    res.render('admin/adminHome');
})


router.get('/accountManagement',async (req, res) => {
    const result = await dbHandler.viewAllAccount("users", "Staff")
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    res.render('admin/accountManagement', { viewAllAccount: result });
})

router.post('/showRoleAccount', async(req, res) => {
    const selectedRole = req.body.txtRoleSelected_toShow;

    const result = await dbHandler.viewAllAccount("users", selectedRole)

    res.render('admin/accountManagement', { viewAllAccount: result });
})

router.post('/doAddAccount',async(req, res) => {
    const newName = req.body.txtNewName;
    const newEmail = req.body.txtNewEmail;
    const newPassword = req.body.txtNewPassword;
    const newAge = req.body.txtNewAge;
    const newPhoneNumber = req.body.txtNewPhoneNumber;
    const selectedRole = req.body.txtRoleSelected;
    const selectedDepartment = req.body.txtDepartmentSelected;

    const isAccountExist = await dbHandler.checkExistAccount(newEmail);

    if (isAccountExist == "Email already in exists !")
    {
        console.log("Email Exist !");
        const result = await dbHandler.viewAllAccount("users", selectedRole)


        res.render('admin/accountManagement', { viewAllAccount: result, implementSuccess: "Email Already Exist !" })

    }
    else{
        console.log("Email Not Exist !");
        var regex = /\d+/; // Check Contains Number 
        if (newName.trim().length < 3) {
            res.render('admin/accountManagement', { errorName: "Error : Name cannot < 3 !" });
        }
        else if (regex.test(newName)) {
            res.render('admin/accountManagement', { errorName: "Name cannot contain Number !" });
        }
        else if (newEmail.trim().length < 0 || newEmail.indexOf('@') == -1) {
            res.render('admin/accountManagement', { errorEmail: "Error : Fill the email & correct format !" })
        } else if (newPassword.trim().length == 0) {
            res.render('admin/accountManagement', { errorPassword: "Error : Password Cannot be Null ! " })
        }
        else if (newAge.trim().length == 0 || newAge < 0 || newAge > 200) {
            res.render('admin/accountManagement', { errorAge: "Error : Input Age and it cannot < 0 or > 200 ! " })
        }
        else if (newPhoneNumber.trim().length == 0 || isNaN(newPhoneNumber) == true) {
            res.render('admin/accountManagement', { errorPhoneNumber: "Error : Input and only Number  ! " })
        }
        else {
            console.log("Start add new account !");
            // Hash Password
            const hashPassword = await bcrypt.hash(newPassword, 10);

            const accountData = {
                name: newName, email: newEmail, password: hashPassword, age: newAge,
                phoneNumber: newPhoneNumber, role: selectedRole, department: selectedDepartment
            }


            // Compare the PASSWORD with HASH PASSWORD & Display in the system
            const compare = await bcrypt.compare(newPassword, hashPassword);
            console.log("New Pass :" + newPassword);
            console.log("Has Pass :" + hashPassword);
            console.log(compare);

            await dbHandler.addNewAccount("users", accountData);

            const result = await dbHandler.viewAllAccount("users", selectedRole)


            res.render('admin/accountManagement', { viewAllAccount: result, implementSuccess: "New Account Added Successfully !" })
        
        }
    }
})

router.get('/deleteAccount',async function (req, res) {

    const userId = req.query.id;

    await dbHandler.deleteFunction("users", userId);
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    res.redirect('accountManagement')

})

router.get('/updateAccount', async (req, res) => {
    const userId = req.query.id;
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    var accountToEdit = await dbHandler.updateFunction("users", userId);
    res.render('admin/updateAccount', { accountDetail: accountToEdit })
})

router.post('/doUpdateAccount', async (req, res) => {
    const userId = req.body.id;
    const nameUpdated = req.body.txtUpdateAccountName;
    const ageUpdated = req.body.txtUpdateAge;
    const phoneNumberUpdated = req.body.txtUpdatePhoneNumber;

    var accountToEdit = await dbHandler.updateFunction("users", userId);

    var errMessage;
    var regex = /\d+/; // Check Contains Number 

    if (nameUpdated == "" || ageUpdated == "" || phoneNumberUpdated == "")
    {
        errMessage = "Fulfill All Data !"
        res.render('admin/updateAccount', { accountDetail: accountToEdit, errorMessage: errMessage })
    } 
    else if (nameUpdated.trim().length < 3) {
        errMessage = "Length of name must > 3 !"
        res.render('admin/updateAccount', { accountDetail: accountToEdit, errorMessage: errMessage })
    }
    else if (regex.test(nameUpdated)) {
        errMessage = "Name cannot contain Number !"
        res.render('admin/updateAccount', { accountDetail: accountToEdit, errorMessage: errMessage })
    }
    else if (ageUpdated.trim().length == 0 || ageUpdated < 0 || ageUpdated > 200) {
        errMessage = "Input Age and it cannot < 0 or > 200 !"
        res.render('admin/updateAccount', { accountDetail: accountToEdit, errorMessage: errMessage })
    }
    else if (phoneNumberUpdated.trim().length == 0 || isNaN(phoneNumberUpdated) == true) {
        errMessage = "Input and only Number  !"
        res.render('admin/updateAccount', { accountDetail: accountToEdit, errorMessage: errMessage })
    }
    else{
        const newValues = {
            $set: {
                name: nameUpdated,
                age: ageUpdated,
                phoneNumber: phoneNumberUpdated
            }
        };

        await dbHandler.doUpdateFunction("users", userId, newValues);

        res.redirect('accountManagement')

    }

})


/* ===================================== Idea Management  ===================================== */
router.get('/postIdeaManagement', async (req, res) => {
    /* 
        Get Post Idea to display with default skip data (0)
    */
    if(!req.session.username  || req.session.user.role != "Admin")
        return res.render('login')
    const currPage = req.query.currPage;

    const countData = await dbHandler.countDataInTable("postIdeas");

    const pages = await calculatePageNumTrue("postIdeas",countData, currPage ?? 1);

    res.render('admin/postIdeaManagement', { 
        currPage: pages.currPage,
        viewAllDataInTable: pages.viewAllData, 
        lastPage: pages.totalPages,
        left: pages.left,
        right: pages.right,
        });
})


// router.get('/updatePostIdea', async (req, res) => {
//     const ideaID = req.query.id;

//     var ideaEdit = await dbHandler.updateFunction("postIdeas", ideaID);
//     res.render('admin/updatePostIdea', { ideaDetail: ideaEdit })
// })


// router.post('/doUpdateIdea', async (req, res) => {
//     const ideaID = req.body.id;
//     const startDateUpdated = req.body.txtUpdateStartDate;
//     const endDateUpdated = req.body.txtUpdateEndDate;

//     const newValues = {
//         $set: {
//             startDate: startDateUpdated,
//             endDate: endDateUpdated
//         }
//     };

//     await dbHandler.doUpdateFunction("postIdeas", ideaID, newValues);

//     res.redirect('postIdeaManagement')
// })


/* ===================================== Related "Available User" Page ============================================= */

router.get('/availableUsers', async (req, res) => {
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    const currPage = req.query.currPage;

    const countData = await dbHandler.countDataInTable("users");

    const pages = await calculatePageNumTrue("users", countData, currPage ?? 1);


    res.render('admin/availableUsers', { 
        currPage: pages.currPage,
        viewAllDataInTable: pages.viewAllData,
        lastPage: pages.totalPages,
        left: pages.left,
        right: pages.right,
        isPagination: true,
    });

})


router.post('/searchAccount', async (req, res) => {
    const searchContent = req.body.txtNameEmailSearch;

    const result = await dbHandler.searchAccount("users", searchContent);

    res.render('admin/availableUsers', {
        viewAllDataInTable: result, isPagination: false  });

})

/* ================================================================================== */

async function calculatePageNumTrue(collection, countData, currPage, limitItemPerPage = 5, maxPageEachSide = 2) {

    const totalPages = Math.ceil(countData / limitItemPerPage);

    if (currPage > totalPages || currPage < 0) { currPage = 1; }

    const skipData = (currPage - 1) * (5);

    const data = await dbHandler.viewAllAccountPaginationCustom(collection, skipData);

    const results = {
        currPage: currPage,
        totalPages: totalPages,
        viewAllData: data,
        left: [],
        right: [],
    }

    for (i = 0; i < maxPageEachSide; i++) {
        const nLeft = parseInt(currPage) - (maxPageEachSide - i);
        const nRight = parseInt(currPage) + (maxPageEachSide - i);

        if (nLeft > 0) {
            results.left.push(nLeft);
        }
        if (nRight <= totalPages) {
            results.right.push(nRight);
        }
    }

    results.right = results.right.sort((a, b) => a - b);

    return results;

}



/* ===================================== Related "Closure Date" Page ============================================= */
router.get('/closureDate', async (req, res) => {
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    const result = await dbHandler.viewAllDataInTable("closureDates");

    const categories = await dbHandler.viewAllDataInTable("categories");
    const count = categories.length;

    const getCategories = [];

    for (let i = 0; i < count; i++) {
        const objectDate = JSON.stringify(categories[i], null, 0);
        console.log("Before Slice : ", objectDate);

        const getCategoriesName = objectDate.slice(42,-2);
        console.log("After Slice : ", getCategoriesName);
        getCategories.push(getCategoriesName)
    }


    res.render('admin/closureDate', { viewAllClosureDate: result, categories: getCategories});
})


router.post('/doSetDate', async (req, res) => {
    const name = req.body.txtCategorySelected;
    const newStartDate = req.body.txtStartDate;
    const newEndDate = req.body.txtEndDate;

    console.log("New Start Date : " , newStartDate);
    console.log("New End Date : ", newEndDate);

    const result = await dbHandler.viewAllDataInTable("closureDates");
    const categories = await dbHandler.viewAllDataInTable("categories");
    const count = categories.length;
    const getCategories = [];
    for (let i = 0; i < count; i++) {
        const objectDate = JSON.stringify(categories[i], null, 0);
        console.log("Before Slice : ", objectDate);
        const getCategoriesName = objectDate.slice(42, -2);
        console.log("After Slice : ", getCategoriesName);
        getCategories.push(getCategoriesName)
    }

    const startDateCheck = Date.parse(newStartDate);
    const endDateCheck = Date.parse(newEndDate);

    if(newStartDate == "" || newEndDate == "")
    {
        res.render('admin/closureDate', { viewAllClosureDate: result, categories: getCategories, 
            errMessage: "Select Start Date & End Date !" });
    }
    else if (startDateCheck > endDateCheck)
    {
        res.render('admin/closureDate', {
            viewAllClosureDate: result, categories: getCategories,
            errMessage: "Start Date cannot > End Date !"
        });
    }
    else{
            const splitStartD = newStartDate.split('-');
            const startYear = splitStartD[0];
            const startMonth = splitStartD[1];
            const startDay = splitStartD[2];
            const FinalStartDate = startDay + "-" + startMonth + "-" + startYear;

            const splitEndD = newEndDate.split('-');
            const endYear = splitEndD[0];
            const endMonth = splitEndD[1];
            const endDay = splitEndD[2];
            const FinalEndDate = endDay + "-" + endMonth + "-" + endYear;

            const setDateValue = {
                name: name,
                startDate: FinalStartDate,
                endDate: FinalEndDate
            };

            await dbHandler.addNewAccount("closureDates", setDateValue);

            res.redirect('closureDate');
    }
})



router.get('/updateClosureDate', async (req, res) => {
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    const dateId = req.query.id;

    var dateEdit = await dbHandler.updateFunction("closureDates", dateId);

    res.render('admin/updateClosureDate', { dateDetail: dateEdit  })
})

router.post('/doUpdateClosureDate', async (req, res) => {
    const dateId = req.body.id;
    const updateStartDate = req.body.txtUpdateStartDate;
    const updateEndDate = req.body.txtUpdateEndDate;


    var err;
    var getDateData = await dbHandler.updateFunction("closureDates", dateId);
    const startDateCheck = Date.parse(updateStartDate);
    const endDateCheck = Date.parse(updateEndDate);

    if (updateStartDate == "" || updateEndDate == "")
    {
        err = "Start Date & End Date Cannot Be bull";
        res.render('admin/updateClosureDate', { dateDetail: getDateData, errorMessage: err })
    } 
    else if (startDateCheck > endDateCheck)
    {
        err = "Start Date cannot >  End Date !";
        res.render('admin/updateClosureDate', { dateDetail: getDateData, errorMessage: err })
    }
    else {
        console.log("Let's update")

        const splitStartD = updateStartDate.split('-');
        const startYear = splitStartD[0];
        const startMonth = splitStartD[1];
        const startDay = splitStartD[2];
        const finalStartDate = startDay + "-" + startMonth + "-" + startYear;

        const splitEndD = updateEndDate.split('-');
        const endYear = splitEndD[0];
        const endMonth = splitEndD[1];
        const endDay = splitEndD[2];
        const finalEndDate = endDay + "-" + endMonth + "-" + endYear;

        console.log(finalStartDate);
        console.log(finalEndDate);

        const updateDateValue = {
            $set: {
                startDate: finalStartDate,
                endDate: finalEndDate
            }
        };

        await dbHandler.doUpdateFunction("closureDates", dateId, updateDateValue);
        res.redirect('closureDate');

    }

})
/* ================================================================================== */




/* ===================================== Related "View Popular Ideas" Page ============================================= */
router.get('/viewPopularIdeas', async (req, res) => {
    result = await dbHandler.viewAllDataInTable("postIdeas");
    if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
    res.render('admin/viewPopularIdeas', { viewLatestIdeas: result})
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

    res.render('admin/viewPopularIdeas', { viewLatestIdeas: result })
})


/* *
    View Idea Detail ( Manh Lam )
*/ 

    router.get('/viewIdea', async (req, res) => {
        if(!req.session.username  || req.session.user.role != "Admin")
    return res.render('login')
        const client = await MongoClient.connect(url);
        const dbo = client.db(dbName);
        const postIdeaId = ObjectId(req.query.id);
        const condition = { "_id": postIdeaId };
        await dbo.collection('postIdeas').updateOne(condition, { $inc: { 'views': 1 } });
        const filter = {
            _id: postIdeaId
        }
        const detailIdea = await dbHandler.getIdeas(filter);
        res.render('admin/viewDetail', {
            viewDetail: detailIdea[0],
            permissions: {
                canRemoveAttachment: req.session.username && (detailIdea.username === req.session.username || req.session.user.role === "Admin" || req.session.user.role === "Staff")
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







router.get('/accountManagementTEST', async (req, res) => {
    // Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    //     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    // });

    const result = await dbHandler.viewAccountPagination("users", 2, "Staff", 0)

    const toCount = await dbHandler.viewAccountPagination("users", 0, "Staff", 0)
    const countData = toCount.length;
    console.log(countData);

    var currRole = "Staff";

    

    // create variable to get the max key ( Value to skip )
    var arrGetKeyOnly = [];

    // Create Dictionary to store KEY ( as value to skip in mongoDB)
    // and VALUE ( as the number of page )
    const arrPage = {};

    var numCalculator = 0;
    var finalPageNumber = 0;

    if (countData % 2 == 0) {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator;

        console.log("Chan ( Page ) = " + finalPageNumber);
    }
    else {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator + 1;

        console.log("Le ( Page ) = " + finalPageNumber);

    }

    var k;
    for (i = 1; i <= finalPageNumber; i++) {

        k = (i - 1) * 2;

        arrGetKeyOnly.push(k);

        arrPage[k] = i;
    }

    res.render('admin/accountManagementTEST', { viewAllAccount: result, viewNumPage: arrPage, 
        currRole: currRole, isStaffRole: true });
})


router.post('/showRoleAccountTEST', async (req, res) => {
    const selectedRole = req.body.txtRoleSelected_toShow;

    var isStaffRole = false;
    var isManagerRole = false;
    var isCorrRole = false;

    if (selectedRole == "Staff")
    {
        isStaffRole = true;
    }
    if (selectedRole == "Quality Assurance Manager") {
        isManagerRole = true;
    }
    if (selectedRole == "Quality Assurance Coordinator") {
        isCorrRole= true;
    }

    const result = await dbHandler.viewAccountPagination("users", 2, selectedRole, 0)

    const toCount = await dbHandler.viewAccountPagination("users", 0, selectedRole, 0)
    const countData = toCount.length;
    console.log(selectedRole + " has " + countData);



    // Create Dictionary to store KEY ( as value to skip in mongoDB)
    // and VALUE ( as the number of page )
    const arrPage = {};

    var numCalculator = 0;
    var finalPageNumber = 0;

    if (countData % 2 == 0) {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator;

        console.log("Chan ( Page ) = " + finalPageNumber);
    }
    else {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator + 1;

        console.log("Le ( Page ) = " + finalPageNumber);

    }

    var k;
    for (i = 1; i <= finalPageNumber; i++) {

        k = (i - 1) * 2;


        arrPage[k] = i;
    }

    res.render('admin/accountManagementTEST', { viewAllAccount: result, viewNumPage: arrPage, 
        isStaffRole: isStaffRole, isManagerRole: isManagerRole, isCorrRole: isCorrRole});
})



router.get('/choosePageUserTEST', async (req, res) => {
    const skipDataGet = req.query.skipData;
    const selectedRole = req.query.currRole;

    var isStaffRole = false;
    var isManagerRole = false;
    var isCorrRole = false;

    if (selectedRole == "Staff") {
        isStaffRole = true;
    }
    if (selectedRole == "Quality Assurance Manager") {
        isManagerRole = true;
    }
    if (selectedRole == "Quality Assurance Coordinator") {
        isCorrRole = true;
    }

    var skipData = parseInt(skipDataGet);
    const result = await dbHandler.viewAccountPagination("users", 2, selectedRole, skipData)

    const toCount = await dbHandler.viewAccountPagination("users", 0, selectedRole, 0)
    const countData = toCount.length;
    console.log(selectedRole + " has " + countData);


    // Create Dictionary to store KEY ( as value to skip in mongoDB)
    // and VALUE ( as the number of page )
    const arrPage = {};

    var numCalculator = 0;
    var finalPageNumber = 0;

    if (countData % 2 == 0) {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator;

        console.log("Chan ( Page ) = " + finalPageNumber);
    }
    else {
        numCalculator = countData / 2;

        finalPageNumber = numCalculator + 1;

        console.log("Le ( Page ) = " + finalPageNumber);

    }

    var k;
    for (i = 1; i <= finalPageNumber; i++) {

        k = (i - 1) * 2;


        arrPage[k] = i;
    }

    res.render('admin/accountManagementTEST', { viewAllAccount: result, viewNumPage: arrPage, 
        isStaffRole, isManagerRole: isManagerRole, isCorrRole: isCorrRole
    });
})






/* ================== 

    TEST Cho Mạnh
    
================== */

router.get('/duyanhTest', async (req, res) => {
    /* 
    Get start date & end date to display
   */
    const dateResult = await dbHandler.viewAllDataInTable("closureDates");
    let finalEndDate, finalStartDate;
    var countDateInDB = dateResult.length;
    console.log("Count Closure Date : " + countDateInDB);

    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");

    var currYear = splitCurrDate[0]

    for (i = 0; i < countDateInDB; i++) {
        const objectDate = JSON.stringify(dateResult[i], null, 2);
        console.log(objectDate)
        const splitDate = objectDate.split(",");
        const fullStartDate = splitDate[1];
        const fullEndDate = splitDate[2];

        // Implement Start Date
        const splitStartDate = fullStartDate.split(":");
        const startDate = splitStartDate[1];
        const startDateSlice = startDate.slice(2, 12);
        const splitStartDate2 = startDateSlice.split("-");
        const dayStartDate = splitStartDate2[0];
        const monthStartDate = splitStartDate2[1];
        const yearStartDate = splitStartDate2[2];

        // Implement End Date
        const splitEndDate = fullEndDate.split(":");
        const endDate = splitEndDate[1];
        const endDateSlice = endDate.slice(2, 12);
        const splitEndDate2 = endDateSlice.split("-");
        const dayEndDate = splitEndDate2[0];
        const monthEndDate = splitEndDate2[1];
        const yearEndDate = splitEndDate2[2];

        if (currYear == yearStartDate) {
            console.log("Found !");
            finalStartDate = dayStartDate + "-" + monthStartDate + "-" + yearStartDate;
            finalEndDate = dayEndDate + "-" + monthEndDate + "-" + yearEndDate;
        }
        else {
            console.log("Not Found !");

        }

    }

    res.render('admin/DuyAnhTest.hbs', {startDate: finalStartDate, endDate:  finalEndDate});
})


router.post('/doSubmitFileWithTime',async (req, res) =>{
    /*
        Start to process when staff click to submib button
        (Check the curr date in is in between start and end date)
    */
    const result = await dbHandler.viewAllDataInTable("closureDates");

    var countDateInDB = result.length;
    console.log("Count : " + countDateInDB);

    var currDate = new Date();
    var currDate2 = currDate.toISOString().slice(0, 10);
    var splitCurrDate = currDate2.split("-");
    var currDay = splitCurrDate[2];
    var currMonth = splitCurrDate[1];
    var currYear = splitCurrDate[0]
    var finalCurrDate = currMonth + "-" + currDay + "-" + currYear;

    let finalEndDate, finalStartDate, finalStartDate2, finalEndDate2;

    for (i = 0; i < countDateInDB; i++) {
        const objectDate = JSON.stringify(result[i], null, 2);
        console.log(objectDate)
        const splitDate = objectDate.split(",");
        const fullStartDate = splitDate[1];
        const fullEndDate = splitDate[2];

        // Implement Start Date
        const splitStartDate = fullStartDate.split(":");
        const startDate = splitStartDate[1];
        const startDateSlice = startDate.slice(2, 12);
        const splitStartDate2 = startDateSlice.split("-");
        const dayStartDate = splitStartDate2[0];
        const monthStartDate = splitStartDate2[1];
        const yearStartDate = splitStartDate2[2];

        // Implement End Date
        const splitEndDate = fullEndDate.split(":");
        const endDate = splitEndDate[1];
        const endDateSlice = endDate.slice(2, 12);
        const splitEndDate2 = endDateSlice.split("-");
        const dayEndDate = splitEndDate2[0];
        const monthEndDate = splitEndDate2[1];
        const yearEndDate = splitEndDate2[2];

        if (currYear == yearStartDate) {
            console.log("Found !");
            finalStartDate = monthStartDate + "-" + dayStartDate + "-" + yearStartDate;
            finalEndDate = monthEndDate + "-" + dayEndDate + "-" + yearEndDate;

            finalStartDate2 = dayStartDate + "-" + monthStartDate+ "-" + yearStartDate;
            finalEndDate2 = dayEndDate + "-" + monthEndDate + "-" + yearEndDate;
        }
        else {
            console.log("Not Found !");

        }

    }

    // Date Format : Month-Day-Year
    console.log("Start Date : " + finalStartDate);
    console.log("End Date : " + finalEndDate);
    console.log("Current Date : " + finalCurrDate);

    var formatStartDate, formatEndDate, formatCurrDate;
    formatStartDate = Date.parse(finalStartDate);
    console.log(formatStartDate);

    formatEndDate = Date.parse(finalEndDate);
    console.log(formatEndDate);

    formatCurrDate = Date.parse(finalCurrDate);
    console.log(formatCurrDate);

    var messageHere;
    if ((formatCurrDate >= formatStartDate && formatCurrDate <= formatEndDate ) )
    {
        messageHere = "Staff CAN Submit File !"
        console.log(messageHere);
    }
    else {
        messageHere = "Staff CANNOT Submit File !"
        console.log(messageHere);

    }

    
    res.render('admin/DuyAnhTest.hbs', { startDate: finalStartDate2, endDate: finalEndDate2, message: messageHere });
})
/* ================== 

    (End) TEST Cho Mạnh
    
================== */






/* ===================================== 

    TEST Pagination ( Idea Management ) 

===================================== */

router.get('/TESTpostIdeaManagement', async (req, res) => {
    const currPageHere = req.query.currPage;

    // Count number of postIdea in table
    const countData = await dbHandler.countDataInTable("postIdeas")


    // Create function to calculate
    // currPage ?? 1 : if NOT GET VALUE of currPage, it will return to page 1.
    const pages = await calculatePageNumFORTEST(countData, currPageHere ?? 1);
    

    res.render('admin/postIdeaManagementTEST', {
        viewAllDataInTable: pages.data,
        currPage: pages.currPage,
        totalPages: pages.totalPages,
        left: pages.left,
        right: pages.right,
    });


})

async function calculatePageNumFORTEST(countData, currPage, limitItemPerPage = 5, maxPageEachSide = 2) 
{
    // ( Total item in table ) divide ( Limit Item Per Page )
    // then Round number Up ( Math.ceil : là func dùng để chia rồi làm tròn lên )
    // => Chia xong làm tròn để lấy tổng số trang.
    const totalPages = Math.ceil(countData / limitItemPerPage);


    // ( Nếu currPage > tổng số trang ) hoặc ( currPage < 1 )
    // => currPage will return to page 1
    if (currPage > totalPages || currPage < 1) currPage = 1;

    // Calculate Skip Date to display in mongoDB
    // limitItemPerPage || 5 : LIMIT ITEM PER PAGE is 5 ( default ) , 
    // in case of dont have limitItemPerPage,is will return to 5.
    // Ex : Page = 1 => Skip Data = 0 (  (1 - 1)*(5)  )
    //      Page = 2 => Skip Data = 5 (  (2 - 1)*(5)  )
    //      Page = 3 => Skip Data = 10 (  (3 - 1)*(5)  )
    const skipData = (currPage - 1) * (limitItemPerPage || 5);


    // Get all data in "postIdea" table with Skip Data
    const data = await dbHandler.viewAllAccountPaginationCustom("postIdeas", skipData);

    // create object "result"
    const result = {
        currPage: currPage,
        totalPages: totalPages,
        left: [],
        right: [],
        data: data,
    };


    // Implement loop to display Page in each side of current page
    // Pages in each side of current page is 2 ( default )
    for (let i = 0; i < maxPageEachSide; i++) {
        // Ex : 
        // (-) if Current Page = 1 ,  
        // + Pages in the left will TRẢ VỀ LẦN LƯỢT là -1 and 0  
        //   ==> K lấy giá trị nào. ( K thỏa mãn numLeft > 0 )
        // + Pages in the right will TRẢ VỀ LẦN LƯỢT là to 3 and 2
        //   ==> Lấy tất cả giá trị. ( Thỏa mãn numRight <= totalPages)
        // => Tại page = 1, thì bên trái sẽ KHÔNG có j, và bên phải có 2 page là 3 và 2.
        let numLeft = parseInt(currPage) - (maxPageEachSide - i);
        let numRight = parseInt(currPage)  + (maxPageEachSide - i);

        if (numLeft > 0) {
            result.left.push(numLeft);
        } 
        if (numRight <= totalPages) {
            result.right.push(numRight);
        } 
    }

    // Như ở trên, phía bên phải trả về 2 page là 3 và 2 ( Xếp lộn xộn )
    // Dùng hàm sort() này để sort lại array từ BÉ ĐẾN LỚN ( Ascending = Tăng dần) 
    // => result.right sẽ TRẢ VỀ 2 pages là 2 và 3.
    result.right = result.right.sort((a, b) => a - b);

    console.log(result);

    return result;
}

/* ===================================== 

    (End ) TEST Pagination ( Idea Management ) 

===================================== */


module.exports = router;