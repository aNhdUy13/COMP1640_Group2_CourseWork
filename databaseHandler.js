var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.3vt1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_Project";

// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');


async function getDBO() {
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    return dbo;
}


/* Admin Role */
async function addNewAccount(collectionName, data){
    const dbo = await getDBO();
    await dbo.collection(collectionName).insertOne(data);
}
/* (End) Admin Role */



/* Login function*/
async function checkUser(emailIn, passwordIn) {
    const dbo = await getDBO();
    const results = await dbo.collection("users").
        findOne({ $and: [{ email: emailIn }] });

    if (results != null)
    {

            return true;
    }

    else
        return false;

}


async function emailFinding(emailIn) {
    const dbo = await getDBO();
    const resultss = await dbo.collection("users").
    find({ email: emailIn }).toArray();
    return resultss;
}
/* End Login function  */


/* Manager function */ 


/* End Manager function*/
module.exports = {
    addNewAccount,
    checkUser,
    emailFinding
}