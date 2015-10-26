var mongolastic = require('mongo-elasticsearch');
var conf        = require('../config');
var _           = require('lodash');

function Importer () {
  var esConf = function () {
    return _.clone(conf.esConfig);
  };

  var t = new mongolastic.Transfer({
    esOpts: esConf(),
    esTargetType: conf.es.type,
    esTargetIndex: conf.es.indexName,
    mongoUri: conf.mongo.uri,
    mongoSourceCollection: conf.mongo.collectionName
  });

  return t.start();
}

module.exports = Importer;
