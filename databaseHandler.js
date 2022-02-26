var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://nguyenduyanh131201:duyanh12345678@cluster0.3vt1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "COMP1640_Project";

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

module.exports = {
    addNewAccount
}