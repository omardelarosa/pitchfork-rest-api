var MongoClient = require('mongodb').MongoClient;
var elasticsearch = require('elasticsearch');

function Importer (opts){
  if (!opts) opts = {};
  this.salt = opts.salt || 'z';
  this.ES = new elasticsearch.Client({
    host: process.env.ES_HOST,
    log: 'trace'
  });
  this.url = process.env.MONGO_URI;
}

Importer.prototype.connectToMongo = function() {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(this.url, function(err, db) {
      if (err) { reject(err); }
      resolve(db);
    });
  }.bind(this));
};

Importer.prototype.findReviews = function (db, pageNumber, nPerPage){
  return new Promise(function (resolve, reject) {
    try {
      var reviews = db.collection('reviews');
    } catch (e) {
      reject(e);
    }
    reviews.find({})
      .sort({ '_date': 1 })
      .skip(pageNumber > 0 ? ((pageNumber-1)*nPerPage) : 0)
      .limit(nPerPage)
      .toArray(function(err, docs) {
        if (err) { reject(err); }
        console.log('Found ', docs.length, ' reviews.');
        resolve(docs);
      });

  });
};

Importer.prototype.findBatchedReviews = function (db){
  return new Promise(function (resolve, reject) {
    try {
      var reviews = db.collection('reviews');
    } catch (e) {
      reject(e);
    }
    var cursor = reviews.find({});//.limit(100);//.sort({ '_date': 1 });
    // var timer;
    var counter = 0;
    var writePromises = [];
    var getNext = function (doc) {
      if (doc) {
        ++counter;
        console.log('Adding: ', doc.title);
        try {
        var p = new Promise(function(resolve, reject){
          var id = this.salt + '_' + counter;
          var d = doc;
          d._id = id;
          this.ES.create({
            index: 'pitchfork',
            type: 'review',
            id: id,
            body: doc
          }, function (err, res) {
            if (err) { reject(err); }
            console.log('Successfully added', doc.title);
            resolve(res);
          });
        }.bind(this));
        console.log('Promise set', p);
        writePromises.push(p);
        } catch (e) {
          reject(e);
        }
      }
      return cursor.hasNext().then(function(bool) {
        if (bool) {
          cursor.next().then(getNext);
        } else {
          Promise.all(writePromises).then(function() {
            // clearTimeout(timer);
            resolve({ status: 'ok', recordsAdded: counter });
          });
        }
      });
    }.bind(this);
    
    // timer = setTimeout(function () {
    //   reject('Timed out');
    // }, 60000);

    getNext().catch(function(err) {
      console.log('Error or done', err);
    });
  }.bind(this));
};

Importer.prototype.batchImportToES = function () {
  return this.connectToMongo()
    .then(this.findBatchedReviews.bind(this));
};

Importer.prototype.addReviewsToES = function (docs) {
  console.log('About to add reviews', docs.length);
  var titlePromises = docs.map(function(d, idx) { 
    return new Promise(function(reject, resolve) {
      var id = this.salt + '_' + idx;
      d._id = id;
      this.ES.create({
        index: 'pitchfork',
        type: 'review',
        id: id,
        body: d
      }).then(function(res) {
        console.log(res);
        resolve(res);
      }).catch(function(err) {
        reject(err);
      });
    }.bind(this));  
  }.bind(this));

  return Promise.all(titlePromises);
};

Importer.prototype.addReviews = function () {
  this.connectToMongo().then(function(db){
    console.log('DB Connected');
    this.findReviews(db, 1, 10).then(function(docs) {
      return this.addReviewsToES(docs).then(function() { 
        db.close(); 
      }).catch(function(err) {
        console.log('error adding to ES', err);
        db.close();
      });
    }.bind(this));
  }.bind(this))
  .catch(function(err) {
    console.log('connection error', err);
  });
};

Importer.prototype.searchReviews = function () {
  
};

module.exports = Importer;
