var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://nguyenduyanh131201:duyanh12345678@cluster0-shard-00-00.letwt.mongodb.net:27017,cluster0-shard-00-01.letwt.mongodb.net:27017,cluster0-shard-00-02.letwt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-kl4ffn-shard-0&authSource=admin&retryWrites=true&w=majority";
const dbName = "COMP1640_Web_DBnew_2";
const fs = require('fs');
// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');


async function getDBO() {
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    return dbo;
}


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



/* =================== Admin Role =================== */
async function addNewAccount(collectionName, data) {
    const dbo = await getDBO();
    await dbo.collection(collectionName).insertOne(data);
}

async function viewAllAccount(collectionName, roleChoice) {
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find({ role: roleChoice }).toArray();

    return result;
}


async function deleteFunction(collectionName,userId)
{
    const dbo = await getDBO();

    var ObjectID = require('mongodb').ObjectID;
    // Lấy Id gửi về
    const condition = { "_id": ObjectID(userId) };

    await dbo.collection(collectionName).deleteOne(condition); //await đợi đến khi kết thúc
}

async function updateFunction(collectionName, userId)
{
    const dbo = await getDBO();
    var ObjectID = require('mongodb').ObjectID;
    // Lấy Id gửi về
    const condition = { "_id": ObjectID(userId) };

    const accountToDelete = await dbo.collection(collectionName).findOne(condition);
    return accountToDelete;
}

async function doUpdateFunction(collectionName, contentID, newValues)
{
    const dbo = await getDBO();

    var ObjectID = require('mongodb').ObjectID;
    // Lấy Id gửi về
    const condition = { "_id": ObjectID(contentID) };
    await dbo.collection(collectionName).updateOne(condition, newValues);
}


async function viewAllDataInTable(collectionName) {
    const dbo = await getDBO();

    const result = await dbo.collection(collectionName).find().toArray();

    return result;

}

async function viewAccountPagination(collectionName, limit, roleChoice, skipData) {
    const dbo = await getDBO();


    const result = await dbo.collection(collectionName).find({ role: roleChoice }).limit(limit).skip(skipData).toArray();

    return result;
}

async function viewAllAccountPaginationCustom(collectionName, skipData) {
    const dbo = await getDBO();

    const mSkipData = parseInt(skipData);

    // sort({{_id : -1}}) => Sort descending by id
    // const result = await dbo.collection(collectionName).find().sort({ _id: -1 }).limit(5).skip(mSkipData).toArray();

    const result = await dbo.collection(collectionName).find().limit(5).skip(mSkipData).toArray();


    return result;
}

async function searchAccount(collectionName, searchContent)
{
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find({
        $or: [{ name: searchContent }, { email: searchContent }]
    }).toArray();

    return result;
}

async function getCategory(collectionName) {
    const dbo = await getDBO();

    const result = await dbo.collection(collectionName).find({}).toArray();

    return result;

}

async function viewLatestPostIdeas(){
    const dbo = await getDBO();


    // sort({{_id : -1}}) => Sort descending by id
    const result = await dbo.collection("postIdeas").find().sort({ _id: -1 }).toArray();

    return result;
}
/* =================== (End) Admin Role =================  */


/* Staff*/
async function viewAll(collectionName) {
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find().toArray();

    return result;
}
async function mostViewed(collectionName) {
    const dbo = await getDBO();
    const mysort = {views: -1}
    const result = await dbo.collection(collectionName).find().sort(mysort).toArray();

    return result;
}


async function getUser(collectionName,email) {
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find({ email: email }).toArray();
    return result;
}
async function viewDetail(collectionName, userId)
{
    const dbo = await getDBO();
    var ObjectId = require('mongodb').ObjectId;
    // Lấy Id gửi về
    const condition = { "_id": ObjectId(userId) };
    await dbo.collection(collectionName).updateOne(condition, {$inc: { 'views': 1}});
    const detailIdea = await dbo.collection(collectionName).findOne(condition);
    return detailIdea;
}

async function checkExists(collectionName, ideaId) {
    const dbo = await getDBO();
    const ObjectId = require('mongodb').ObjectId;
    const condition = { "_id": ObjectId(ideaId) };
    const result = await dbo.collection(collectionName).countDocuments(condition, {limit: 1});
    return result;
}

async function addIdeaFile(collectionName, ideaId, files) {
    const dbo = await getDBO();
    const ObjectId = require('mongodb').ObjectId;
    const condition = { "_id": ObjectId(ideaId) };
    const result = await dbo.collection(collectionName).updateOne(condition, {
        $push: {
            files: {
                $each: files
            }
        }
    })
    return result;
}

async function removeIdeaFile(collectionName, ideaId, file) {
    const dbo = await getDBO();
    const ObjectId = require('mongodb').ObjectId;
    const condition = { "_id": ObjectId(ideaId) };
    const result = await dbo.collection(collectionName).updateOne(condition, {
        $pull: {
            files: {
                fileName: file.fileName,
                url: file.url
            }
        }
    });
    fs.unlink(__dirname + '/public' + file.url, function (err) {
        console.log(err)
    });
    return result;
}


/* End Staff function */ 


/* Manager function */ 
async function viewAllCategory(collectionName) {
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find().toArray();
    return result;
}

async function mostPopular(collectionName) {
    const dbo = await getDBO();
    const sort111 = {popularpoint: -1}
    const result = await dbo.collection(collectionName).find().sort(sort111).toArray();

    return result;
}

/* End Manager function*/



module.exports = {
    addNewAccount,
    checkUser,
    emailFinding,
    viewAllAccount,
    deleteFunction,
    updateFunction,
    doUpdateFunction,
    viewAll,
    getCategory,
    viewAllDataInTable,
    getUser,
    viewAccountPagination,
    viewAllAccountPaginationCustom,
    viewAllCategory,
    searchAccount,
    viewDetail,
    mostViewed,
    checkExists,
    addIdeaFile,
    removeIdeaFile,
    viewLatestPostIdeas,
    mostPopular,
}