import fetch from 'node-fetch';
import { accounts, database } from './data.js';
import fs from 'fs';

const csv_file = 'ouranos_working_bot.csv';

function getDate() {
	return new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
}

(async function () {
	try {
		/** DB setup */
		
		await database.connect();
		const table = 'public.ouranos_working_bot';
		let query, res;
		
		/* Create the DB if not exist */
		query = `
		CREATE TABLE IF NOT EXISTS ${table}
		(
		    id VARCHAR(20) NOT NULL,
		    money_total integer NOT NULL,
		    money integer NOT NULL,
		    money_mean integer NOT NULL,
		    total_days_count integer NOT NULL,
		    count_total integer NOT NULL,
		    count integer NOT NULL,
		    count_mean integer NOT NULL,
		    error integer NOT NULL,
		    date timestamp without time zone NOT NULL,
		    CONSTRAINT ouranos_working_bot_pkey PRIMARY KEY (id)
		)`;
		/* ! Add new column to insert into ! */
		await database.query( query );
		
		/* Read the backup */
		
		let csv_data = fs.readFileSync( './csv/' + csv_file, 'utf8' ).replace( /"/g, '' ).split( '\r\n' );
		console.log(csv_data);
		const keys = csv_data[0].split( ',' );
		const database_bak = [];
		csv_data = csv_data.slice( 1 );
		
		csv_data.forEach( (line, line_i) => {
			database_bak.push( {} );
			line.split( ',' ).forEach( (item, i) => {
				database_bak[line_i][keys[i]] = item;
			} );
		} );
		
		
		/* For each account, set up a DB row, and add it to the data array */
		const data = await Promise.all( accounts.map( async (account, id) => {
			
			query = `SELECT * FROM ${table} WHERE  id='${account.id}'`;
			res = await database.query( query );
			
			/* Create the row if row doesn't exist */
			if (!res.rows.length) {
				const backup = database_bak.find( obj => obj.id === account.id );
				if (backup) {
					console.log( `Row ${accounts[id].id} is empty, backup recovery` );
					query = `INSERT INTO ${table} VALUES ('${account.id}', ${backup.money_total}, ${backup.money}, ${backup.money_mean}, ${backup.total_days_count}, ${backup.count_total}, ${backup.count}, ${backup.count_mean}, ${backup.error}, '${backup.date}')`;
				} else {
					console.log( `Row ${accounts[id].id} is empty, init a new row` );
					query = `INSERT INTO ${table} VALUES ('${account.id}', 0, 0, 0, 0, 0, 0, 0, 0, '${getDate()}')`;
				}
				await database.query( query );
				query = `SELECT * FROM ${table} WHERE  id='${account.id}'`;
				res = await database.query( query );
			}
			
			return res.rows[0];
		} ) );
		
		console.log( data );
		
		async function save_data(data, id) {
			/**
			 * Save data in the corresponding DB row
			 * id: The DB row id
			 * @type {string}
			 */
			try {
				query = `
				UPDATE ${table}
				SET
				total_days_count = ${data.total_days_count},
				money_total = ${data.money_total},
				money = ${data.money},
				money_mean = ${data.money_mean},
				count_total = ${data.count_total},
				count = ${data.count},
				count_mean = ${data.count_mean},
				error = ${data.error},
				date = '${getDate()}'
				WHERE id='${id}'
				`;
				await database.query( query );
			} catch (e) {
				console.log( e );
			}
		}
		
		/** Working bot */
		
		const
			cooldown = 10 * 1e3,
			one_hour = 3.6e6,
			pay_interval = one_hour * 5,
			work_interval = one_hour,
			retry = one_hour / 12;
		
		/* Workers */
		
		let main_account;
		accounts.forEach( account => {if (account.pay === false) {return main_account = account;}} );
		
		accounts.map( (account, id) => {
			
			/* Pay */
			if (account.pay) {
				console.log( `Account ${account.id} is paying ${main_account.id}` );
				pay( account, main_account );
			}
			
			/* Work */
			const wait_time = 60 - (Date.parse( getDate() ) - data[id].date.getTime()) / 6e4;
			
			if (wait_time > 0) {
				console.log( `${account.id} will works in ${wait_time.toFixed( 0 )} mins | Date: ${getDate()}` );
				setTimeout( () => work( account, id ), wait_time * 6e4 + cooldown * Math.random() );
			} else {
				console.log( `${account.id} will works now` );
				work( account, id );
			}
		} );
		
		
		async function work(account, id) {
			/**
			 * Work for each account, every hour
			 */
			try {
				await fetch( 'https://discord.com/api/v9/interactions', {
					'headers': {
						'accept': '*/*',
						'accept-language': 'fr,fr-FR;q=0.9',
						'authorization': account.authorization,
						'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryMcqN0DmNbQHonseA',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'same-origin',
						'x-debug-options': 'bugReporterEnabled',
						'x-discord-locale': 'en-GB',
						'x-fingerprint': '1010702419111460874.LzvOdL3jTREmOoBLHZQudC-bGV4',
						'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MDA2Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjIwMDAiLCJvc19hcmNoIjoieDY0Iiwic3lzdGVtX2xvY2FsZSI6ImZyIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTQyODY4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
						'cookie': '__dcfduid=0c095750eae211ec9277b769df24b26a; __sdcfduid=0c095751eae211ec9277b769df24b26a78e0361b8f672f8cf7c211b13c347439284eab11bde79ecf445cdd901eadf5ec; __stripe_mid=55cdba8e-92b0-496c-8851-3025451e30e60d8f68; locale=en-GB',
					},
					'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
					'referrerPolicy': 'strict-origin-when-cross-origin',
					'body': `------WebKitFormBoundaryMcqN0DmNbQHonseA\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${account.session_id}\",\"data\":{\"version\":\"1001148798988472382\",\"id\":\"1001148798988472381\",\"guild_id\":\"902947280162811975\",\"name\":\"work\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1010702591710986240\"}\r\n------WebKitFormBoundaryMcqN0DmNbQHonseA--\r\n`,
					'method': 'POST',
					'mode': 'cors',
				} ).then( async res => {
					/* To compare with the bot message timestamp */
					const timestamp = new Date().setMilliseconds( -cooldown );
					
					/* Calculate mean of the day */
					if (new Date( Date.parse( getDate() ) ).getDate() !== data[id].date.getDate()) {
						data[id].date = new Date().getDay();
						data[id].total_days_count += 1;
						data[id].count_mean += ((data[id].count - data[id].count_mean) / data[id].total_days_count);
						data[id].money_mean += ((data[id].money - data[id].money_mean) / data[id].total_days_count);
						data[id].money = 0;
						data[id].count = 0;
					}
					let money = 0;
					if (res.ok) {
						data[id].count += 1;
						data[id].count_total += 1;
						
						/**
						 * Fetch money gain
						 */
						await new Promise( resolve => setTimeout( resolve, cooldown / 2 ) );
						money = await fetch( 'https://discord.com/api/v9/channels/905426507021811772/messages?limit=10', {
							'headers': {
								'accept': '*/*',
								'accept-language': 'fr,fr-FR;q=0.9',
								'authorization': account.authorization,
								'sec-fetch-dest': 'empty',
								'sec-fetch-mode': 'cors',
								'sec-fetch-site': 'same-origin',
								'x-debug-options': 'bugReporterEnabled',
								'x-discord-locale': 'en-GB',
							},
							'referrer': 'https://discord.com/channels/902947280162811975/952558030556389466',
							'referrerPolicy': 'strict-origin-when-cross-origin',
							'body': null,
							'method': 'GET',
							'mode': 'cors',
						} ).then( res => res.json().then( json => {
							
							/* Get the last message > timestamp - cooldown */
							for (const message of json) {
								if (message.author.id === '952125649345196044' && message.interaction.user.id === account.id && message.interaction.name === 'work') {
									if (new Date( message.timestamp ).getTime() > timestamp) return parseInt( message.content.split( '**' )[1] );
								}
							}
							return 0;
							
						} ) );
					}
					if (money && res.ok) {
						data[id].money_total += money;
						data[id].money += money;
						console.log( `Id: ${account.id} | Money: ${data[id].money} | Mean: ${data[id].money_mean} | Gain: ${money} | Count: ${data[id].count} | OK: ${res.ok} | Status: ${res.status} ${res.statusText} | Date: ${getDate()}` );
						
						setTimeout( () => work( account, id ), work_interval + cooldown * Math.random() );
						
					} else {
						console.log( `${account.id} failed, cooldown : ${retry / 6e4} mins ( OK: ${res.ok} | Status: ${res.status} ${res.statusText} | Gain: ${money} | Error: ${data[id].error} | Date: ${getDate()} )` );
						data[id].error += 1;
						
						setTimeout( () => work( account, id ), retry + cooldown * Math.random() );
					}
					await save_data( data[id], account.id );
				} );
			} catch (e) {
				console.log( 'Work crash', e );
				data[id].error += 1;
				setTimeout( () => work( account, id ), retry + cooldown * Math.random() );
			}
		} /* eof work */
		
		async function pay(payer, receiver) {
			/**
			 * Money laundering
			 */
			try {
				await fetch( 'https://discord.com/api/v9/interactions', {
					'headers': {
						'accept': '*/*',
						'accept-language': 'fr,fr-FR;q=0.9',
						'authorization': payer.authorization,
						'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryAAewkFPiiGspgS7p',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'same-origin',
						'x-debug-options': 'bugReporterEnabled',
						'x-discord-locale': 'fr',
					},
					'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
					'referrerPolicy': 'strict-origin-when-cross-origin',
					'body': `------WebKitFormBoundaryAAewkFPiiGspgS7p\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${payer.session_id}\",\"data\":{\"version\":\"1000878143072120923\",\"id\":\"1000878143072120922\",\"guild_id\":\"902947280162811975\",\"name\":\"money\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1011078265214861312\"}\r\n------WebKitFormBoundaryAAewkFPiiGspgS7p--`,
					'method': 'POST',
					'mode': 'cors',
				} ).then( async res => {
					
					if (res.ok) {
						
						await new Promise( resolve => setTimeout( resolve, cooldown / 2 ) );
						await fetch( 'https://discord.com/api/v9/channels/905426507021811772/messages?limit=10', {
							'headers': {
								'accept': '*/*',
								'accept-language': 'fr,fr-FR;q=0.9',
								'authorization': payer.authorization,
								'sec-fetch-dest': 'empty',
								'sec-fetch-mode': 'cors',
								'sec-fetch-site': 'same-origin',
								'x-debug-options': 'bugReporterEnabled',
								'x-discord-locale': 'en-GB',
							},
							'referrer': 'https://discord.com/channels/902947280162811975/952558030556389466',
							'referrerPolicy': 'strict-origin-when-cross-origin',
							'body': null,
							'method': 'GET',
							'mode': 'cors',
						} ).then( res => res.json().then( json => {
							
							for (const message of json) {
								if (message.author.id === '952125649345196044' && message.interaction.user.id === payer.id && message.interaction.name === 'money') {
									return parseInt( message.content.split( '**' )[1] );
								}
							}
							return 0;
							
						} ) ).then( async money => {
							
							if (!money) {
								console.log( `Id: ${payer.id} | Money laundering cancelled : You got no money !` );
								setTimeout( () => pay( payer, receiver ), pay_interval + cooldown * Math.random() );
								return;
							}
							
							await fetch( 'https://discord.com/api/v9/interactions', {
								'headers': {
									'accept': '*/*',
									'accept-language': 'fr,fr-FR;q=0.9',
									'authorization': payer.authorization,
									'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarybJ8QMNc6sxequ4mv',
									'sec-fetch-dest': 'empty',
									'sec-fetch-mode': 'cors',
									'sec-fetch-site': 'same-origin',
									'x-debug-options': 'bugReporterEnabled',
									'x-discord-locale': 'fr',
								},
								'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
								'referrerPolicy': 'strict-origin-when-cross-origin',
								'body': `------WebKitFormBoundarybJ8QMNc6sxequ4mv\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n{"type":2,"application_id":"952125649345196044","guild_id":"902947280162811975","channel_id":"905426507021811772","session_id":"1a69649039e71a2487bdc37557c173dc","data":{"version":"1000878228195520584","id":"1000878228195520583","guild_id":"902947280162811975","name":"pay","type":1,"options":[{"type":6,"name":"mention","value":"${receiver.id}"},{"type":10,"name":"money","value":${money}}],"attachments":[]},"nonce":"1010719020845891584"}\r\n------WebKitFormBoundarybJ8QMNc6sxequ4mv--`,
								'method': 'POST',
								'mode': 'cors',
							} ).then( res => {
								
								if (res.ok) {
									console.log( `Id: ${payer.id} | Money successfully laundered (${money})` );
									setTimeout( () => pay( payer, receiver ), pay_interval + cooldown * Math.random() );
									
								} else {
									console.log( `Id: ${payer.id} | Money laundering failed, retry in ${retry / 6e4} mins` );
									setTimeout( () => pay( payer, receiver ), retry + cooldown * Math.random() );
								}
								
							} );
						} );
						
					} else {
						console.log( res.ok, res.status, res.statusText );
						
					}
				} );
			} catch (e) {
				console.log( 'Pay crash', e );
				setTimeout( () => pay( payer, receiver ), retry + cooldown * Math.random() );
			}
		} /* eof pay */
		
	} catch (e) {
		console.log( e );
	}
})();
