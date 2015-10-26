
var Config = {
  
  esConfig: {
    host: process.env.ES_URI
  },

  es: {
    type: 'review',
    indexName: 'pitchfork'
  },

  mongo: {
    uri: process.env.MONGO_URI,
    collectionName: 'reviews'
  }

};


module.exports = Config;
