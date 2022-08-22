import PG from 'pg';
import parse from 'url-parse';
import dotenv from 'dotenv';

dotenv.config();

/* Get accounts object */
export const accounts = JSON.parse( process.env.ACCOUNTS );

/* Get data credentials from url */
const db = parse( process.env.DATABASE_URL );

export const database = new PG.Client( {
	user: db.username,
	host: db.hostname,
	database: db.pathname.slice( 1 ),
	password: db.password,
	port: db.port,
	ssl: {
		rejectUnauthorized: false,
	},
} );
