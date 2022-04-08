var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://nguyenduyanh131201:duyanh12345678@cluster0-shard-00-00.letwt.mongodb.net:27017,cluster0-shard-00-01.letwt.mongodb.net:27017,cluster0-shard-00-02.letwt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-kl4ffn-shard-0&authSource=admin&retryWrites=true&w=majority";
const dbName = "COMP1640_Web_DBnew_2";
const fs = require('fs');
// Import dependencies to hash passwordToCompare
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');


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

async function checkExistAccount(userEmail) {
    const dbo = await getDBO();

    const result = await dbo.collection("users").findOne({ email: userEmail });

    var message;
    if (result) {
        message = "Email already in exists !";
    } else {
        message = "Good Email";
    }
    return message;

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

async function countDataInTable(collectionName) {
    const dbo = await getDBO();

    const result = await dbo.collection(collectionName).countDocuments({});

    return result;

}

async function viewAccountPagination(collectionName, limit, roleChoice, skipData) {
    const dbo = await getDBO();


    const result = await dbo.collection(collectionName).find({ role: roleChoice }).limit(limit).skip(skipData).toArray();

    return result;
}

async function viewAllAccountPaginationCustom(collectionName, skipData, limitData = 5) {
    const dbo = await getDBO();

    const mSkipData = parseInt(skipData);
    console.log(mSkipData);
    // sort({{_id : -1}}) => Sort descending by id
    // const result = await dbo.collection(collectionName).find().sort({ _id: -1 }).limit(5).skip(mSkipData).toArray();

    const result = await dbo.collection(collectionName).find().skip(mSkipData).limit(limitData).toArray();


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
// async function viewDetail(collectionName, userId)
// {
//     const dbo = await getDBO();
//     var ObjectId = require('mongodb').ObjectId;
//     // Lấy Id gửi về
//     const condition = { "_id": ObjectId(userId) };
//     await dbo.collection(collectionName).updateOne(condition, {$inc: { 'views': 1}});
//     const detailIdea = await dbo.collection(collectionName).findOne(condition);
//     return detailIdea;
// }

async function viewComment(collectionName, postIdeaId)
{
    const dbo = await getDBO();
    var ObjectId = require('mongodb').ObjectId;
    // Lấy Id gửi về
    const condition = { "_id": ObjectId(postIdeaId) };
    await dbo.collection(collectionName).updateOne(condition, {$inc: { 'views': 1}});
    const detailComment = await dbo.collection(collectionName).findOne(condition);
    return detailComment;
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
async function searchFilename(categoryN) {
    const dbo = await getDBO();
    const result = await dbo.collection("postIdeas").find({category:categoryN}).toArray();
    // get URL from Mongo
    let resultArray =[] 
    result.forEach(item => {
        item.files.forEach(items=>{
            resultArray.push(items.url);
        })      
    });
    // Get file name from URL
    const fileName = resultArray.map((itemss) =>{
        return itemss.slice(9);
    } )

    console.log(fileName);
    return fileName;
}
async function viewFirstCategory(collectionName,categoryN) {
    const dbo = await getDBO();
    const result = await dbo.collection(collectionName).find({category:categoryN}).toArray();
    return result;
}

async function searchFirstCate() {
    const dbo = await getDBO();
    const result = await dbo.collection("categories").find().toArray();
    const nameCate = result.map((item) =>{
        return item.name
    } )

    return nameCate[0];
}
async function searchCateName() {
    const dbo = await getDBO();
    const result = await dbo.collection("categories").find().toArray();
    const nameCate = result.map((item) =>{
        return item.name
    } )

    return nameCate;
}
async function mostPopular(collectionName) {
    const dbo = await getDBO();
    const sort111 = {popularpoint: -1}
    const result = await dbo.collection(collectionName).find().sort(sort111).toArray();

    return result;
}
async function countIdea(department,year){
    const dbo = await getDBO();
    const result = await dbo.collection("postIdeas").find({department:department,year:year}).toArray();
    const countI = result.length;
    return countI;
}

async function countStaff(department,year){
    const dbo = await getDBO();
    const result = await dbo.collection("postIdeas").find({department:department,year:year}).toArray();
    
    const emailStaff = result.map((item) =>{
        return item.email
    } )

    var finalresult = []
    for (var i = 0; i < emailStaff.length; i++) {
      if (finalresult.indexOf(emailStaff[i]) === -1) {
        finalresult.push(emailStaff[i])
      }
    }

    const countstaff = finalresult.length;
    return countstaff;
}

async function findYear(department){
    const dbo = await getDBO();
    const result = await dbo.collection("postIdeas").find().toArray();
    const yearStaff = result.map((item) =>{
        return item.year
    } )

    var finalresult = []
    for (var i = 0; i < yearStaff.length; i++) {
      if (finalresult.indexOf(yearStaff[i]) === -1) {
        finalresult.push(yearStaff[i])
      }
    }

    finalresult = finalresult.sort((a,b)=>a-b);

    console.log(finalresult);
    return finalresult;
}

async function updatePopularPoint(){
    const dbo = await getDBO();
    const result = await dbo.collection("postIdeas").find().toArray();
    
    const idIdea = result.map((item) =>{
        return item._id
    } )

    const likeIdea = result.map((item) =>{
        return item.likers
    } )

    const dislikeIdea = result.map((item) =>{
        return item.dislikers
    } )
    let a
    let ist = 0 

    let newValues 

    for (var i = 0; i < idIdea.length; i++) {
        a=likeIdea[i].length - dislikeIdea[i].length
        const condition = { "_id": idIdea[i] };
        newValues = {
            $set: {
                popularpoint: a
            }
        };
        await dbo.collection("postIdeas").updateOne(condition, newValues);
    }
}

/* End Manager function*/

/* Comment */

async function getComments(filter = {}, options = {}) {
    const pipeline = [
        {
            $match: {
                ...filter //{postIdeaId: new ObjectID('623c1905bd948b0f8a04fbb1')}
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { user: "$userId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$user"]
                            },
                        }
                    }
                ],
                as: 'author',
            }
        },
        {
            $unwind: "$author"
        },
        {
            $lookup: {
                from: 'postIdeas',
                let: { ideaId: "$postIdeaId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$ideaId"]
                            },
                        }
                    }
                ],
                as: 'postIdea',
            }
        },
        {
            $unwind: "$postIdea"
        },
        {
            $skip: options.skip ?? 0
        },
        {
            $sort: options.sort ?? { commentTime: -1 }
        }
    ];
    if (options.limit) pipeline.push({
        $limit: options.limit
    })
    const dbo = await getDBO();
    const result = await dbo.collection('comments').aggregate(pipeline).toArray();
    return result;  
}

async function addComment(body) {
    const dbo = await getDBO();
    const result = await dbo.collection("comments").insertOne({
        "postIdeaId": ObjectId(body.postId),
        "userId":  ObjectId(body.userId),
        "content": body.content,
        "commentTime": Date.now(),
    })
    return result;
}

async function getIdeas(filter = {}, options = {}) {
    const dbo = await getDBO();
    const pipeline = [
        {
            $match: {
                ...filter
            }
        },
        {
            $lookup: {
                from: "comments",
                let: { ideaId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$postIdeaId", "$$ideaId"]
                            },
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            //let: { userId: "$userId" },
                            // pipeline: [
                            //     {
                            //         $match: {
                            //             $expr: {
                            //                 $eq: ["$_id", "$$userId"]
                            //             },
                            //         }
                            //     },
                            // ],
                            
                            as: "author"
                        }
                    },
                    {
                        $unwind: {
                            path: "$author",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {commentTime: -1}
                    }
                    
                ],
                as: "comments"
            }
        },
        {
            $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                "comments.author.password": 0
            }
        },
        {
            $group: {
                _id: "$_id",
                topic: {$first: "$topic"},
                description: {$first: "$description"},
                category: {$first: "$category"},
                email: {$first: "$email"},
                username: {$first: "$username"},
                files: {$first: "$files"},
                views: {$first: "$views"},
                likers: {$first: "$likers"},
                dislikers: {$first: "$dislikers"},
                year: {$first: "$year"},
                department: {$first: "$department"},
                createdAt: {$first: "$createdAt"},
                comments: {
                    $addToSet: "$comments"
                }
            }
        },
        {
            $skip: options.skip ?? 0
        },
        {
            $sort: options.sort ?? { createdAt: -1 }
        }
    ]
    if (options.limit) pipeline.push({
        $limit: options.limit
    })
    const result = await dbo.collection('postIdeas').aggregate(pipeline).toArray();
    for (let doc of result) {
        doc.comments.sort((a, b) => {return a.commentTime - b.commentTime});
    }
    return result;
}

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
    mostViewed,
    checkExists,
    addIdeaFile,
    removeIdeaFile,
    viewLatestPostIdeas,
    mostPopular,
    countDataInTable,
    getComments,
    addComment,
    countIdea,
    countStaff,
    findYear,
    updatePopularPoint,
    viewComment,
    getIdeas,
    searchFirstCate,
    searchCateName,
    viewFirstCategory,
    searchFilename,
    checkExistAccount
}