//Global variables
module.exports = {
  read : function(collection,criteria,projection,callback){
    read(collection,criteria,projection,callback);
  }
}

//import database
var MongoClient = require('mongodb').MongoClient;
var assert      = require('assert');
var ObjectId    = require('mongodb').ObjectID;

var mongodb_url = db_info.mongodb;

var read = function(collection,criteria,projection,callback){
  //performance.start();
  try{
    MongoClient.connect(mongodb_url, function(err, mongodb) {
      mongodb.collection(collection).findOne(criteria, function (err, doc) {
        if (err || !doc){
          mongodb.close();
          if(!doc){
            err = 0;
	  }
          callback(err,null);
        }else{
          mongodb.close();
          if(Object.keys(projection).length>0){
            for(var key in projection){
              results_returned[key] = doc[key];
            }
          }else{
            results_returned = doc;
          }
          callback(null,results_returned);
        }
      });
    });
  }catch(err){
    console.log(err);
  }
}
