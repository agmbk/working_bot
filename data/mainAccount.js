const accounts = require('./accounts.js');


module.exports = accounts.find(account => account.pay === false);
