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

router.get('/viewManagerAccount', async (req, res) => {
    const result = await dbHandler.viewAllAccount("users", "Quality Assurance Manager")
    res.render('admin/accountManagement', { viewAllAccount: result });
})

router.get('/viewCoordinatorAccount', async (req, res) => {
    const result = await dbHandler.viewAllAccount("users", "Quality Assurance Coordinator")
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
module.exports = router;