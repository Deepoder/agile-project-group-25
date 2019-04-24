const MongoClient = require('mongodb').MongoClient;

var _db = null;

module.exports.getDb = function() {
    return _db;
};

module.exports.init = function(callback) {
    MongoClient.connect('mongodb://localhost:27017/fighting_game_db', function(err, client) {
        if (err) {
            return console.log('Unable to connect to DB');
        }
        _db = client.db('fighting_game_db');
        console.log('Successfully connected to MongoDB server');
    });
};