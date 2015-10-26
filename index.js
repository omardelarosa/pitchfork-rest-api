var mongolastic = require('mongo-elasticsearch');
var t = new mongolastic.Transfer({
  esOpts: {
    host: process.env.ES_URI,
    log: 'trace',
    keepAlive: true
  },
  esTargetType: 'review',
  esTargetIndex: 'pitchfork_copy',
  mongoUri: process.env.MONGO_URI,
  mongoSourceCollection: 'reviews'
});

t.start().then(function(status) {
  console.log('Exiting without error');
  console.log(status);
  process.exit();
}).catch(function(err) {
  throw err;
});
