import config from '../config.json' assert { type: 'json' };
import database from './database.js';
import accounts from './accounts.js';
import fs from 'fs';
import { getDateObject } from '../functions/dateHandler.js';


await database.connect();
let query, res;

/* Create the DB if not exist */
query = `
    CREATE TABLE IF NOT EXISTS ${config.table}
    ( /* ! Add new column to insert into ! */
        id VARCHAR(20) NOT NULL,
        money_total integer NOT NULL,
        money integer NOT NULL,
        money_mean integer NOT NULL,
        total_days_count integer NOT NULL,
        count_total integer NOT NULL,
        count integer NOT NULL,
        count_mean integer NOT NULL,
        error integer NOT NULL,
        date timestamp with time zone NOT NULL,
        CONSTRAINT ouranos_working_bot_pkey PRIMARY KEY(id)
        )`;

await database.query( query );

/* Read the backup */
let csv_data = fs.readFileSync( `data/` + config.backup, 'utf8' ).replace( /"/g, '' ).replace( /\r/g, '' ).split( '\n' );

const keys = csv_data[0].split( ',' );
csv_data = csv_data.slice( 1 );

const database_bak = [];
csv_data.forEach( (line, line_i) => {
	
	database_bak.push( {} );
	line.split( ',' ).forEach( (item, i) => {
		database_bak[line_i][keys[i]] = item;
	} );
} );

/* For each account, set up a DB row, and add it to the data array */
const data = await Promise.all( accounts.map( async (account, id) => {
	
	query = `SELECT *
             FROM ${config.table}
             WHERE id = '${account.id}'`;
	res = await database.query( query );
	
	/* Create the row if row doesn't exist */
	if (!res.rows.length) {
		
		const backup = database_bak.find( obj => obj.id === account.id );
		
		if (backup) {
			console.warn( `Row ${accounts[id].id} is empty, backup recovery` );
			query = `INSERT INTO ${config.table}
                     VALUES ('${account.id}', ${backup.money_total}, ${backup.money}, ${backup.money_mean},
                             ${backup.total_days_count}, ${backup.count_total}, ${backup.count}, ${backup.count_mean},
                             ${backup.error}, '${backup.date}')`;
			
		} else {
			console.warn( `Row ${accounts[id].id} is empty, init a new row` );
			query = `INSERT INTO ${config.table}
                     VALUES ('${account.id}', 0, 0, 0, 0, 0, 0, 0, 0, 0)`;
		}
		
		await database.query( query );
		query = `SELECT *
                 FROM ${config.table}
                 WHERE id = '${account.id}'`;
		res = await database.query( query );
	}
	
	res.rows[0].date = getDateObject( res.rows[0].date )
	return res.rows[0];
} ) );


export default data;
