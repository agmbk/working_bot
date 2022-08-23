import PG from 'pg';
import parse from 'url-parse';
import dotenv from 'dotenv';
dotenv.config();


/* Get data credentials from url */
const db = parse( process.env.DATABASE_URL );

export default new PG.Client( {
	user: db.username,
	host: db.hostname,
	database: db.pathname.slice( 1 ),
	password: db.password,
	port: db.port,
	ssl: {
		rejectUnauthorized: false,
	},
} );