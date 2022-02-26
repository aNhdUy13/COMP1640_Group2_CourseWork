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
    /* 
        const originalPassword = "123456";
        const password = "123456";

        // Hash password & display in the system
        const hashPassword = await bcrypt.hash(originalPassword, 10);
        console.log(hashPassword);

        // Compare the PASSWORD with HASH PASSWORD & Display in the system
        const compare = await bcrypt.compare(password, hashPassword);
        console.log(compare);
    */


    res.render('admin/accountManagement');
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



module.exports = router;