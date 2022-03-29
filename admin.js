const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('admin/adminHome');
})


router.get('/accountManagement',async (req, res) => {
    const result = await dbHandler.viewAllAccount("users", "Staff")
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

    if (newName.trim().length < 3)
    {
        res.render('admin/accountManagement', { errorName: "Error : Name cannot < 3 !"});
    }
    else if (newEmail.trim().length < 0 || newEmail.indexOf('@') == -1)
    {
        res.render('admin/accountManagement', { errorEmail: "Error : Fill the email & correct format !" })
    } else if (newPassword.trim().length == 0)
    {
        res.render('admin/accountManagement', { errorPassword: "Error : Password Cannot be Null ! " })
    } 
    else if (newAge.trim().length == 0 || newAge < 0 || newAge > 200)
    {
        res.render('admin/accountManagement', { errorAge: "Error : Input Age and it cannot < 0 or > 200 ! " })
    }
    else if (newPhoneNumber.trim().length == 0 || isNaN(newPhoneNumber) == true)
    {
        res.render('admin/accountManagement', { errorPhoneNumber: "Error : Input and only Number  ! " })
    }
    else {
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


        res.render('admin/accountManagement', { viewAllAccount: result , implementSuccess: "New Account Added Successfully !" })
    }


})

router.get('/deleteAccount',async function (req, res) {

    const userId = req.query.id;

    await dbHandler.deleteFunction("users", userId);
    res.redirect('accountManagement')

})

router.get('/updateAccount', async (req, res) => {
    const userId = req.query.id;

    var accountToEdit = await dbHandler.updateFunction("users", userId);
    res.render('admin/updateAccount', { accountDetail: accountToEdit })
})

router.post('/doUpdateAccount', async (req, res) => {
    const userId = req.body.id;
    const nameUpdated = req.body.txtUpdateAccountName;
    const ageUpdated = req.body.txtUpdateAge;
    const phoneNumberUpdated = req.body.txtUpdatePhoneNumber;

    const newValues = {
        $set: {
            name: nameUpdated,
            age: ageUpdated,
            phoneNumber: phoneNumberUpdated
        }
    };

    await dbHandler.doUpdateFunction("users", userId, newValues);

    res.redirect('accountManagement')

})


/* ===================================== Idea Management  ===================================== */
router.get('/postIdeaManagement', async (req, res) => {
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


    /* 
        Get Post Idea to display with default skip data (0)
    */
    // const result = await dbHandler.viewAllDataInTable("postIdeas");
    const result = await dbHandler.viewAllAccountPaginationCustom("postIdeas", 0);

    const toCount = await dbHandler.viewAllDataInTable("postIdeas")
    const countData = toCount.length;
    console.log(countData);

    // create variable to get the max key ( Value to skip )
    var arrGetKeyOnly = [];

    // Create Dictionary
    const arrPage = {};

    calculatePageNum(countData, arrPage, arrGetKeyOnly);


    // Calculate to get max key.
    console.log("Key ( Array ) = " + arrGetKeyOnly);
    let max = arrGetKeyOnly[0];

    for (i = 1; i <= arrGetKeyOnly.length; i++) {
        if (arrGetKeyOnly[i] > max) {
            max = arrGetKeyOnly[i];
        }
    }
    console.log("Max Key = " + typeof max + " " + max);


    res.render('admin/postIdeaManagement', { viewAllDataInTable: result, viewNumPage: arrPage , 
        startDate: finalStartDate, endDate: finalEndDate, lastPage: max });
})

router.get('/choosePageIdea', async (req, res) => {
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



    /* 
        Get Idea to display with custom skip data
    */
    const skipData = req.query.skipData;

    const date = await dbHandler.viewAllDataInTable("closureDates");
    const result = await dbHandler.viewAllAccountPaginationCustom("postIdeas", skipData);

    const toCount = await dbHandler.viewAllDataInTable("postIdeas")
    const countData = toCount.length;
    console.log(countData);

    // create variable to get the max key ( Value to skip )
    var arrGetKeyOnly = [];

    var arrPage = {};

    calculatePageNum(countData, arrPage, arrGetKeyOnly)


    // Calculate to get max key.
    console.log("Key ( Array ) = " + arrGetKeyOnly);
    let max = arrGetKeyOnly[0];

    for (i = 1; i <= arrGetKeyOnly.length; i++) {
        if (arrGetKeyOnly[i] > max) {
            max = arrGetKeyOnly[i];
        }
    }
    console.log("Max Key = " + typeof max + " " + max);

    res.render('admin/postIdeaManagement', { viewAllDataInTable: result, viewNumPage: arrPage, 
        startDate: finalStartDate, endDate: finalEndDate, lastPage: max });
})


router.get('/updatePostIdea', async (req, res) => {
    const ideaID = req.query.id;

    var ideaEdit = await dbHandler.updateFunction("postIdeas", ideaID);
    res.render('admin/updatePostIdea', { ideaDetail: ideaEdit })
})


router.post('/doUpdateIdea', async (req, res) => {
    const ideaID = req.body.id;
    const startDateUpdated = req.body.txtUpdateStartDate;
    const endDateUpdated = req.body.txtUpdateEndDate;

    const newValues = {
        $set: {
            startDate: startDateUpdated,
            endDate: endDateUpdated
        }
    };

    await dbHandler.doUpdateFunction("postIdeas", ideaID, newValues);

    res.redirect('postIdeaManagement')
})


/* ===================================== Related "Available User" Page ============================================= */

router.get('/availableUsers', async (req, res) => {
    // View all data in "users" table and skip 0 value
    // "viewAllAccountPaginationCustom" has limit item to display ( 5 )
    const result = await dbHandler.viewAllAccountPaginationCustom("users", 0);

    // Get all data in "users" table to count as well as calculate 
    // the number of of page
    const toCount = await dbHandler.viewAllDataInTable("users")
    const countData = toCount.length;
    console.log(countData);

    // create variable to get the max key ( Value to skip )
    var arrGetKeyOnly = [];

    // Create Dictionary to store KEY ( as value to skip in mongoDB)
    // and VALUE ( as the number of page )
    const arrPage = {};


    calculatePageNum(countData, arrPage, arrGetKeyOnly)


    // Calculate to get max key.
    console.log("Key ( Array ) = " + arrGetKeyOnly);
    let max = arrGetKeyOnly[0];

    for (i = 1; i <= arrGetKeyOnly.length; i++) {
        if (arrGetKeyOnly[i] > max) {
            max = arrGetKeyOnly[i];
        }
    }
    console.log("Max Key = " + typeof max + " " + max);



    res.render('admin/availableUsers', { viewAllAccount: result, viewNumPage: arrPage, lastPage: max });

})

router.get('/choosePageUser', async (req, res) => {
    const skipData = req.query.skipData;

    const result = await dbHandler.viewAllAccountPaginationCustom("users", skipData);

    const toCount = await dbHandler.viewAllDataInTable("users")
    const countData = toCount.length;
    console.log(countData);

    // create variable to get the max key ( Value to skip )
    var arrGetKeyOnly = [];

    var arrPage = {};

    calculatePageNum(countData, arrPage, arrGetKeyOnly)

    // Calculate to get max key.
    // console.log("Key ( Array ) = " + arrGetKeyOnly);
    let max = arrGetKeyOnly[0];

    for (i = 1; i <= arrGetKeyOnly.length; i++) {
        if (arrGetKeyOnly[i] > max) {
            max = arrGetKeyOnly[i];
        }
    }
    // console.log("Max Key = " + typeof max + " " + max);

    res.render('admin/availableUsers', { viewAllAccount: result, viewNumPage: arrPage, lastPage: max });
})

router.post('/searchAccount', async (req, res) => {
    const searchContent = req.body.txtNameEmailSearch;

    const result = await dbHandler.searchAccount("users", searchContent);

    res.render('admin/availableUsers', { viewAllAccount: result });

})

/* ================================================================================== */


function calculatePageNum(countData, arrPage, arrGetKeyOnly) {
    

    var numCalculator = 0;
    var finalPageNumber = 0;
    
    if (countData % 5 == 0) {

        // ( 5 Item per page )
        // Total item = 5 (/5) => finalPageNumber = 1 ( Page )
        // Total item = 10 (/5) => finalPageNumber = 2 ( Pages )
        // Total item = 15 (/5) => finalPageNumber = 3 ( Pages )
        // Total item = 20 (/5) => finalPageNumber = 4 ( Pages )
        numCalculator = countData / 5;

        finalPageNumber = numCalculator;

        console.log("Chan ( Page ) = " + finalPageNumber);
    }
    else {
        // ( 5 Item per page )
        // Total item = 1 (/5) => finalPageNumber = 1.2 ( 1 Page )
        // Total item = 4 (/5) => finalPageNumber = 1.8 ( 1 Page )
        // Total item = 6 (/5) => finalPageNumber = 2.2 ( 2 Page )
        // Total item = 9 (/5) => finalPageNumber = 2.8 ( 2 Page )
        // Total item = 11 (/5) => finalPageNumber = 3.2 ( 3 Page )
        // Total item = 14 (/5) => finalPageNumber = 3.8 ( 3 Page )

        numCalculator = countData  / 5;

        finalPageNumber = numCalculator + 1;

        console.log("Le ( Page ) = " + finalPageNumber);

    }

    var k;
    for (i = 1; i <= finalPageNumber; i++) {

        k = (i - 1) * 5;

        arrGetKeyOnly.push(k);

        arrPage[k] = i;
    }

    // var arrPage2 = new Object();
    // arrPage2["0"] = 1;
    // arrPage2["5"] = 2;
    // arrPage2["10"] = 3;
    // arrPage2["15"] = 4;
    // arrPage2["16"] = 5;
    // arrPage2["20"] = 6;



    // Display key of dictionary ( value to skip in mongoDB )
    console.log(Object.keys(arrPage));

    // Display value of dictionary ( number of page )
    for (var value in arrPage) {

        console.log(arrPage[value]);

    }


}




/* ===================================== Related "Closure Date" Page ============================================= */
router.get('/closureDate', async (req, res) => {

    const result = await dbHandler.viewAllDataInTable("closureDates");

    res.render('admin/closureDate', {viewAllClosureDate: result});
})


router.post('/doSetDate', async (req, res) => {
    
    const newStartDate = req.body.txtStartDate;
    const newEndDate = req.body.txtEndDate;

    // console.log(newStartDate);
    // console.log(newEndDate);

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
            startDate: FinalStartDate,
            endDate: FinalEndDate
        };

        await dbHandler.addNewAccount("closureDates", setDateValue);

        res.redirect('closureDate');

})



router.get('/updateClosureDate', async (req, res) => {
    const dateId = req.query.id;

    var dateEdit = await dbHandler.updateFunction("closureDates", dateId);

    res.render('admin/updateClosureDate', { dateDetail: dateEdit  })
})

router.post('/doUpdateClosureDate', async (req, res) => {
    const dateId = req.body.id;
    const updateStartDate = req.body.txtUpdateStartDate;
    const updateEndDate = req.body.txtUpdateEndDate;


    var err = "Start Date & End Date Cannot Be bull";
    var getDateData = await dbHandler.updateFunction("closureDates", dateId);

    if (updateStartDate == "")
    {
        res.render('admin/updateClosureDate', { dateDetail: getDateData, errorMessage: err })
    } else if (updateEndDate == "")
    {
        res.render('admin/updateClosureDate', { dateDetail: getDateData, errorMessage: err })    }
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
    result = await dbHandler.viewLatestPostIdeas();

    res.render('admin/viewPopularIdeas', { viewLatestIdeas: result})
})

router.post('/ChoseViewTypePopularIdeas', async (req, res) => {
    const selectedViewType = req.body.txtSelectedViewType;

    let result;
    if (selectedViewType == "LatestIdeas") {
        result = await dbHandler.viewLatestPostIdeas();
    }
    else if (selectedViewType == "LatestComments")
    {

    }
    else if (selectedViewType == "MostLikeAndDislike") {
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
    /* 
        Get Post Idea to display with default skip data (0)
    */
    // const result = await dbHandler.viewAllDataInTable("postIdeas");
    const count = await dbHandler.countDataInTable("postIdeas")
    const pages = await calculatePageNumFORTEST(count, req.query.page ?? 1);
    res.render('admin/postIdeaManagementTEST', {
        viewAllDataInTable: pages.data,
        currPage: pages.currPage,
        totalPages: pages.totalPages,
        left: pages.left,
        right: pages.right,
    });


})


// router.get('/TESTchoosePageIdea', async (req, res) => {
//     /* 
//         Get Idea to display with custom skip data
//     */
//     const skipData = req.query.skipData;
//     const currPage = req.query.pageNum;

//     const result = await dbHandler.viewAllAccountPaginationCustom("postIdeas", skipData);

//     const toCount = await dbHandler.viewAllDataInTable("postIdeas")
//     const countData = toCount.length;
//     console.log(countData);

//     // create variable to get the max key ( Value to skip )
//     var arrGetKeyOnly = [];
//     var arrGetNumPage = [];

//     // Create Dictionary to STORE key (Value to SKip)
//     // and STORE value (Page Number)
//     const arrPage = {};



//     calculatePageNumFORTEST(countData, arrPage, arrGetKeyOnly, arrGetNumPage)


//     // Calculate to get max key.
//     console.log("Key ( Array ) = " + arrGetKeyOnly);
//     let max = arrGetKeyOnly[0];

//     for (i = 1; i <= arrGetKeyOnly.length; i++) {
//         if (arrGetKeyOnly[i] > max) {
//             max = arrGetKeyOnly[i];
//         }
//     }
//     console.log("Max Key = " + typeof max + " " + max);

//     res.render('admin/postIdeaManagementTEST', {
//         viewAllDataInTable: result, viewNumPage: arrPage,
//         lastPage: max, 
        
//     });
// })

async function calculatePageNumFORTEST(countData, currPage, numPerPage = 2, maxPage = 2) {
    const totalPages = Math.ceil(countData / numPerPage);
    if (currPage > totalPages || currPage < 1) currPage = 1;
    const skip = (currPage - 1) * (numPerPage || 2);
    const rows = await dbHandler.viewAllAccountPaginationCustom("postIdeas", skip);
    const result = {
        currPage: currPage,
        totalPages: totalPages,
        left: [],
        right: [],
        data: rows,
    };
    for (let i = 0; i < maxPage; i++) {
        let numLeft = currPage - (maxPage - i);
        let numRight = +currPage + (maxPage - i);
        if (numLeft > 0) {
            result.left.push(numLeft);
        } 
        if (numRight <= totalPages) {
            result.right.push(numRight);
        } 
    }
    result.right = result.right.sort((a, b) => a - b);
    console.log(result);
    return result;
}

/* ===================================== 

    (End ) TEST Pagination ( Idea Management ) 

===================================== */


module.exports = router;