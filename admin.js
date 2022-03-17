const express = require('express');
const router = express.Router();
const session = require('express-session');
const dbHandler = require('./databaseHandler');

// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');
const { route } = require('express/lib/router');

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
            phoneNumber: newPhoneNumber, role: selectedRole
        }

        await dbHandler.addNewAccount("users", accountData);

        res.render('admin/accountManagement', { implementSuccess: "New Account Added Successfully !" })
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


/* Idea Management  */
router.get('/postIdeaManagement', async (req, res) => {
    const result = await dbHandler.viewAllDataInTable("postIdeas")
    res.render('admin/postIdeaManagement', { viewAllDataInTable: result });
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
    const result = await dbHandler.viewAllAccountPaginationCustom("users", 0);

    const toCount = await dbHandler.viewAllDataInTable("users")
    const countData = toCount.length;
    console.log(countData);

    var numCalculator = 0;
    var finalNumber = 0;

    // Create Dictionary
    const arrPage = {};

    calculatePageNum(countData, numCalculator, finalNumber, arrPage)

    res.render('admin/availableUsers', { viewAllAccount: result, viewNumPage: arrPage });

})

router.get('/choosePage', async (req, res) => {
    const skipData = req.query.skipData;

    const result = await dbHandler.viewAllAccountPaginationCustom("users", skipData);

    const toCount = await dbHandler.viewAllDataInTable("users")
    const countData = toCount.length;
    console.log(countData);

    var numCalculator = 0;
    var finalNumber = 0;
    var arrPage = {};

    calculatePageNum(countData, numCalculator, finalNumber, arrPage)

    res.render('admin/availableUsers', { viewAllAccount: result, viewNumPage: arrPage });
})

function calculatePageNum(count, numCalculator, finalPageNumber, arrPage) {
    if (count % 2 == 0) {

        numCalculator = count / 4;

        finalPageNumber = numCalculator;

        console.log("Chan ( Page ) = " + finalPageNumber);
    }
    else {
        numCalculator = (count - 1) / 4;

        finalPageNumber = numCalculator + 1;

        console.log("Le ( Page ) = " + finalPageNumber);

    }

    var k;
    for (i = 1; i <= finalPageNumber; i++) {

        k = (i - 1) * 4;

        arrPage[k] = i;
    }

    // var arrPage2 = new Object();
    // arrPage2["0"] = 1;
    // arrPage2["4"] = 2;
    // arrPage2["8"] = 3;
    // arrPage2["12"] = 4;
    // arrPage2["16"] = 5;
    // arrPage2["20"] = 6;


    console.log(Object.keys(arrPage));

    for (var value in arrPage) {

        console.log(arrPage[value]);

    }


}

router.post('/searchAccount', async (req, res) => {
    const searchContent = req.body.txtNameEmailSearch;

    const result = await dbHandler.searchAccount("users", searchContent);

    res.render('admin/availableUsers', { viewAllAccount: result });

})
/* ================================================================================== */



module.exports = router;