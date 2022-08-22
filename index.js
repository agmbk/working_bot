import fetch from 'node-fetch';
import { accounts, database } from './data.js';
import fs from 'fs';

String.prototype.red = function () {
	return '\u001b[31;1m' + this + '\u001b[0m';
};
String.prototype.green = function () {
	return '\u001b[32;1m' + this + '\u001b[0m';
};
String.prototype.yellow = function () {
	return '\u001b[33;1m' + this + '\u001b[0m';
};
String.prototype.blue = function () {
	return '\u001b[34;1m' + this + '\u001b[0m';
};
String.prototype.purple = function () {
	return '\u001b[35;1m' + this + '\u001b[0m';
};
String.prototype.cyan = function () {
	return '\u001b[36;1m' + this + '\u001b[0m';
};
String.prototype.grey = function () {
	return '\u001b[37;1m' + this + '\u001b[0m';
};

const csv_file = 'ouranos_working_bot.csv';

function getDate() {
	return new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
}

(async function () {
	function resFormat(res) {
		return `OK: ${res.ok} | Status: ${res.status === 204 ? res.status.toString().green() : res.status.toString().red()} ${res.status === 204 ? res.statusText.toString().green() : res.statusText.toString().red()}`;
	}
	
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
		
		let csv_data = fs.readFileSync( './csv/' + csv_file, 'utf8' ).replace( /"/g, '' ).replace( /\r/g, '' ).split( '\n' );
		
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
		console.log( '*** Database setup ***'.blue() );
		const data = await Promise.all( accounts.map( async (account, id) => {
			
			query = `SELECT * FROM ${table} WHERE  id='${account.id}'`;
			res = await database.query( query );
			
			/* Create the row if row doesn't exist */
			if (!res.rows.length) {
				const backup = database_bak.find( obj => obj.id === account.id );
				if (backup) {
					console.warn( `Row ${accounts[id].id} is empty, backup recovery` );
					query = `INSERT INTO ${table} VALUES ('${account.id}', ${backup.money_total}, ${backup.money}, ${backup.money_mean}, ${backup.total_days_count}, ${backup.count_total}, ${backup.count}, ${backup.count_mean}, ${backup.error}, '${backup.date}')`;
				} else {
					console.warn( `Row ${accounts[id].id} is empty, init a new row` );
					query = `INSERT INTO ${table} VALUES ('${account.id}', 0, 0, 0, 0, 0, 0, 0, 0, 0)`;
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
				console.error( e );
			}
		}
		
		/** Working bot */
		
		const
			cooldown = 10 * 1e3,
			one_hour = 3.6e6,
			one_minute = 6e4,
			pay_interval = one_hour * 48,
			work_interval = one_hour,
			cant_c_me = one_hour / 1,
			retry = one_minute * 5;
		
		/** Workers */
		
		console.log( '*** Workers start-up ***'.blue() );
		
		/* Work */
		accounts.map( (account, id) => {
			const wait_time = 60 - (Date.parse( getDate() ) - data[id].date.getTime()) / one_minute;
			
			if (wait_time > 0) {
				const timeout = wait_time * one_minute + cooldown * Math.random();
				console.log( `${account.id} will works in ${wait_time.toFixed( 0 )} mins | Date: ${getDate()}` );
				
				work( account, id, timeout );
				
			} else {
				console.log( `${account.id} will works now | Date: ${getDate()}` );
				work( account, id, 0 );
			}
		} );
		
		/* Pay */
		let main_account;
		accounts.forEach( account => {if (account.pay === false) {return main_account = account;}} );
		accounts.map( (account, id) => {
			if (account.pay) {
				console.log( `${account.id} is paying ${main_account.id}` );
				setTimeout( () => pay( account, main_account ), one_hour );
			}
		} );
		
		console.log( '*** Work result ***'.blue() );
		
		async function work(account, id, timeout) {
			/**
			 * Work for each account, every hour
			 */
			timeout += cant_c_me * Math.random();
			console.log( 'Waiting', (timeout / one_minute).toFixed( 0 ), 'mins' );
			await new Promise( resolve => setTimeout( resolve, timeout ) );
			
			const hour = new Date( Date.parse( getDate() ) ).getHours();
			if (2 < hour && hour < 7) {
				await work( account, id, timeout );
			}
			
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
						
						console.log( `${account.id.green()} | Money: ${data[id].money.toString().blue()} | Mean: ${data[id].money_mean} | Gain: ${money.toString().green()} | Count: ${data[id].count} | Date: ${getDate()}` );
						
						const timeout = work_interval + cooldown * Math.random();
						await save_data( data[id], account.id );
						await work( account, id, timeout );
						
					} else {
						console.warn( `${account.id.red()} failed ( ${resFormat( res )} | Gain: ${money === 0 ? money.toString().red() : money.toString().green()} | Error: ${data[id].error} | Date: ${getDate()} )` );
						data[id].error += 1;
						
						const timeout = retry + cooldown * Math.random();
						await work( account, id, timeout );
					}
				} );
			} catch (e) {
				console.error( 'Work has crashed'.red(), e );
				data[id].error += 1;
				
				const timeout = retry + cooldown * Math.random();
				await work( account, id, timeout );
			}
			
		} /* eof work */
		
		async function pay(payer, receiver) {
			/**
			 * Money laundering
			 */
			
			const hour = new Date( Date.parse( getDate() ) ).getHours();
			if (2 < hour && hour < 7) {
				setTimeout( () => pay( payer, receiver ), pay_interval + cant_c_me * Math.random() );
			}
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
						
						await new Promise( resolve => setTimeout( resolve, 5e3 ) );
						const messages = await fetch( 'https://discord.com/api/v9/channels/905426507021811772/messages?limit=10', {
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
						} ).then( res => res.json() );
						
						/* Try to get the last payement */
						for (const message of messages) {
							if (message.author.id === '952125649345196044' && message.interaction.user.id === payer.id && message.interaction.name === 'pay') {
								const minutes = ((Date.parse( getDate() ) - Date.parse( message.timestamp )) / one_minute).toFixed( 0 );
								const money = parseInt( message.content.split( '**' )[1] );
								if (minutes < pay_interval / one_minute) {
									console.warn( `${payer.id.green()} | Money laundered ${minutes} mins ago (${money.toString().green()})` );
								}
								setTimeout( () => pay( payer, receiver ), pay_interval + cant_c_me * Math.random() );
								return;
							}
						}
						
						/* Get money amount from messages */
						let money;
						for (const message of messages) {
							if (message.author.id === '952125649345196044' && message.interaction.user.id === payer.id && message.interaction.name === 'money') {
								money = parseInt( message.content.split( '**' )[1] );
							}
						}
						
						if (money === 0) {
							console.warn( `${payer.id.red()} | Money laundering cancelled : ${'You got no money'.red()} !` );
							setTimeout( () => pay( payer, receiver ), pay_interval + cant_c_me * Math.random() );
							return;
						}
						
						if (money) {
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
									console.log( `${payer.id.green()} | Money successfully laundered (${money.toString().green()})` );
									
								} else {
									console.warn( `${payer.id.red()} | Money laundering failed, retry in ${retry / one_minute} mins` );
								}
								setTimeout( () => pay( payer, receiver ), pay_interval + cant_c_me * Math.random() );
							} );
						}
					}
					/* Probably invalid account */
					console.error( `Fetching money failed | ${resFormat( res )} | Date: ${getDate()}`.red() );
					setTimeout( () => pay( payer, receiver ), retry + cant_c_me * Math.random() );
				} );
			} catch (e) {
				console.error( 'Pay has crashed'.red(), e );
				setTimeout( () => pay( payer, receiver ), retry + cant_c_me * Math.random() );
			}
		} /* eof pay */
		
	} catch (e) {
		console.error( e );
	}
})();

// light '\u001b[31;2m' + this + '\u001b[0m'
// bright '\u001b[31;1m' + this + '\u001b[0m'
// underline '\u001b[31;4m' + this + '\u001b[0m'
// highlight '\u001b[31;7m' + this + '\u001b[0m'
