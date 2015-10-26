var elasticSearch = require('elasticsearch');
var conf          = require('../../config');
var esConfig      = conf.esConfig;
var _             = require('lodash');
var client        = new elasticSearch.Client(esConfig);

module.exports = {
  byQueryString: function (req, res, next) {
    if (!req.params || !req.params.query) {
      res.send(400);
    }
    var q = req.params.query;
    client.search({
      index: 'pitchfork',
      q: q
    }).then(function(esResponse) {
      res.send(esResponse.hits); 
    }, function (err) {
      console.log('Error:');
      console.log(err.message);
      console.log(err.stack);
      res.send(500);
    });
  }
};
