const MongoClient = require('mongodb').MongoClient;
// const mongoose = require('mongoose');
const DB_URI = 'mongodb://localhost:27017/fighting_game_db'
//
// function connect(){
//     return new Promise((resolve, reject) =>{
//         mongoose.connect(DB_URI, {useNewUrlParser: true, useCreateIndex: true})
//             .then((res, err) => {
//                 if (err) return reject (error);
//                 resolve()
//             })
//     });
// }
//
// function close() {
//     return mongoose.disconnect()
// }
//
// module.exports = { connect, close}

var _db = null;

module.exports.getDb = function() {
    return _db;
};

module.exports.init = function(callback) {
    MongoClient.connect('mongodb://localhost:27017/fighting_game_db',function(err, client) {
        if (err) {
            return console.log('Unable to connect to DB');
        }
        _db = client.db('fighting_game_db');
        console.log('Successfully connected to MongoDB server');
    });
};