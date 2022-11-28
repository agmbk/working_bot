const PG = require('pg');
const dotenv = require('dotenv');

dotenv.config();

module.exports = new PG.Client({
	host: '127.0.0.1',
	port: '5432',
	user: 'postgres',
	password: 'SlZkclpsQXhRVXRRU1RJd2NUTjJNbGxLZGxsU1owbFdYbFJSZERkVFhrMUtjMDVMUmlWUVlYTlBOamhqT1hSQ0tqQjVTVGRIZUcxWVVGUmVNRTVwZFZKVmRyWmxBeFFVdFFTVEl3Y1ROMk1sbEtkbGxTWjBsV1hsUlJkRGRUWGsxS2MwNUxSaVZRWVhOUE5qaGpPWFJDS2pCNVNUZEhlRzFZVUZSZU1FNXBkVg',
	database: 'working_bot'
});