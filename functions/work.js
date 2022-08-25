import fetch from 'node-fetch';
import config from '../config.json' assert { type: 'json' };
import getDate from './getDate.js';
import mainAccount from '../data/mainAccount.js';
import saveData from './saveData.js';

function resFormat(res) {
	return `OK: ${res.ok ? res.ok.toString().green() : res.ok.toString().red()} | Status: ${res.status === 204 ? `${res.status} ${res.statusText}`.green() : `${res.status} ${res.statusText}`.red()}`;
}

/**
 * @name work
 * @description Work, fetch gain and save it into the DB, every work_interval
 * first fetch: works
 * second fetch: fetch money gain amount
 *
 * @param {Object} account account
 * @param {Object} data data corresponding to the account
 * @param {int} timeout time in milliseconds to wait before working
 * @returns {void}
 */
export default async function work(account, data, timeout) {
	
	timeout += config.cant_c_me * Math.random();
	console.log( 'Waiting', (timeout / config.one_minute).toFixed( 0 ).cyan(), 'mins' );
	await new Promise( resolve => setTimeout( resolve, timeout ) );
	
	/* Work less at night */
	const currentHours = new Date( Date.parse( getDate() ) ).getHours();
	if (config.night.includes( currentHours )) {
		console.log( `It's the night` );
		
		if (account.id !== mainAccount.id) {
			// let date = new Date(Date.parse(getDate()))
			// date.setHours(date.getHours() + (config.night.at(-1) - currentHours))
			// timeout = Date.parse(getDate())  + config.cooldown * Math.random();
			timeout = config.work_interval + config.cooldown * Math.random();
			return work( account, data, timeout );
		} else if (Math.random() > 0.3) {
			const timeout = config.work_interval + config.cooldown * Math.random();
			return work( account, data, timeout );
		}
	}
	
	/* Secondary accounts work 2 time less */
	if (account.id !== mainAccount.id) {
		const timeout = config.work_interval + config.cooldown * Math.random();
		if (Math.random() > 0.3) return work( account, data, timeout );
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
			'referrer': `https://discord.com/channels/902947280162811975/905426507021811772`,
			'referrerPolicy': 'strict-origin-when-cross-origin',
			'body': `------WebKitFormBoundaryMcqN0DmNbQHonseA\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${account.session_id}\",\"data\":{\"version\":\"1001148798988472382\",\"id\":\"1001148798988472381\",\"guild_id\":\"902947280162811975\",\"name\":\"work\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1010702591710986240\"}\r\n------WebKitFormBoundaryMcqN0DmNbQHonseA--\r\n`,
			'method': 'POST',
			'mode': 'cors',
		} ).then( async res => {
			
			/* Calculate mean of the day */
			const date_now = new Date( Date.parse( getDate() ) );
			date_now.setDate( date_now.getDate() - 1 );
			if (data.date.getDate() === date_now.getDate() || data.date < date_now) {
				console.log( 'new day'.red(), data.date.getDate(), date_now.getDate(), data.date, date_now );
				data.total_days_count += 1;
				data.count_mean += ((data.count - data.count_mean) / data.total_days_count);
				data.money_mean += ((data.money - data.money_mean) / data.total_days_count);
				data.money = 0;
				data.count = 0;
			}
			let money = 0;
			if (res.ok) {
				data.count += 1;
				data.count_total += 1;
				
				/**
				 * Fetch money gain
				 */
				await new Promise( resolve => setTimeout( resolve, config.one_second * 5 ) );
				money = await fetch( `https://discord.com/api/v9/channels/905426507021811772/messages?limit=30`, {
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
							const mess_timestamp = Date.parse( getDate( message.timestamp ) );
							console.log( `Last money message ${new Date( mess_timestamp )} (${parseInt( message.content.split( '**' )[1] )} | Date : ${getDate()})` );
							if (mess_timestamp > data.date.getTime()) return parseInt( message.content.split( '**' )[1] );
						}
					}
					return 0;
					
				} ) );
			}
			data.date = new Date( Date.parse( getDate() ) );
			
			if (money && res.ok) {
				data.money_total += money;
				data.money += money;
				
				console.log( `${account.id.green()} | Money: ${data.money.toString().blue()} | Mean: ${data.money_mean} | Gain: ${money.toString().green()} | Count: ${data.count} | Date: ${getDate()}` );
				
				const timeout = config.work_interval + config.cooldown * Math.random();
				await saveData( data, account.id );
				return work( account, data, timeout );
				
			} else {
				console.warn( `${account.id.red()} failed ( ${resFormat( res )} | Gain: ${money === 0 ? money.toString().red() : money.toString().green()} | Error: ${data.error} | Date: ${getDate()} )` );
				data.error += 1;
				
				const timeout = config.retry + config.cooldown * Math.random();
				return work( account, data, timeout );
			}
		} );
	} catch (e) {
		console.error( 'Work has crashed'.red(), e );
		data.error += 1;
		
		const timeout = config.retry + config.cooldown * Math.random();
		return work( account, data, timeout );
	}
	
} /* eof work */