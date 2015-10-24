var Importer = require('./src/importer');
var i = new Importer({ salt: 'ggg' });

i.batchImportToES().then(function(status) {
  console.log('Exiting without error', status);
  process.exit();
}).catch(function(err) {
  throw err;
});
