import config from '../config.json' assert { type: 'json' };
import fetch from 'node-fetch';
import mainAccount from '../data/mainAccount.js';
import { getLocaleDateString, isCurrentDay } from './dateHandler.js';
import saveData from './saveData.js';
import fetchResFormat from './fetchResFormat.js';
import getActivity from './getActivity.js';

/**
 * @name work
 * @description Work retry executor
 *
 * @param {Object} account account
 * @param {Object} data data corresponding to the account
 * @returns {void}
 */
async function work_retry(account, data) {
	/** Retry timeout */
	
	const timeout = config.retry;
	await new Promise( resolve => setTimeout( resolve, timeout ) );
	work(account, data, timeout)
}

/**
 * @name work
 * @description Work timeout executor
 *
 * @param {Object} account account
 * @param {Object} data data corresponding to the account
 * @param {int} timeout time in milliseconds to wait before working
 * @returns {void}
 */
export async function work_cant_c_me(account, data, timeout) {
	/** Waiting timeout */
	
	timeout += config.cant_c_me * Math.random();
	let working_at = new Date();
	working_at.setMilliseconds( working_at.getMilliseconds() + timeout );
	console.log( account.id.toString().cyan(), 'Working at', getLocaleDateString( working_at ).green(), 'in', timeout  / config.one_minute);
	await new Promise( resolve => setTimeout( resolve, timeout ) );
	work(account, data)
}

/**
 * @name work
 * @description Work if channel is active, fetch gain and save it into the DB, every work_interval
 *
 * @param {Object} account account
 * @param {Object} data data corresponding to the account
 * @returns {void}
 */
export default async function work(account, data) {
	
	/** Activity count */
	const activity = await getActivity( account );
	if /** Main account */ (account.id === mainAccount.id) {
		if (activity < 1) {
			console.log( account.id.toString().cyan(), 'activity'.red(), activity, 'waiting...' );
			if (Math.random() < 0.9) {
				return work_retry( account, data )
			}
		} else {
			if (Math.random() < 0.1) {
				return work_retry( account, data )
			}
			console.log( account.id.toString().cyan(), 'activity'.cyan(), activity );
		}
		
	} else /** Secondary accounts work less */{
		await new Promise( resolve => setTimeout( resolve, config.one_minute ) );
		if (activity <= 6) {
			console.log( account.id.toString().cyan(), 'activity'.red(), activity, 'waiting...' );
			return work_retry( account, data )
		}
		console.log( account.id.toString().cyan(), 'activity'.cyan(), activity );
	}
	
	/* Work less at night
	 const currentHours = getLocaleDate().getHours();
	 if (config.night.includes( currentHours )) {
	 console.log( `It's the night` );
	 
	 if (account.id !== mainAccount.id) {
	 // let date = new Date(Date.parse(getLocaleDate()))
	 // date.setHours(date.getHours() + (config.night.at(-1) - currentHours))
	 // timeout = Date.parse(getLocaleDate())  + config.cooldown * Math.random();
	 timeout = config.work_interval + config.cooldown * Math.random();
	 return work( account, data, timeout );
	 } else if (Math.random() > 0.1) {
	 const timeout = config.work_interval + config.cooldown * Math.random();
	 return work( account, data, timeout );
	 }
	 }
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
			'referrer': `https://discord.com/channels/902947280162811975/905426507021811772`,
			'referrerPolicy': 'strict-origin-when-cross-origin',
			'body': `------WebKitFormBoundaryMcqN0DmNbQHonseA\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${account.session_id}\",\"data\":{\"version\":\"1001148798988472382\",\"id\":\"1001148798988472381\",\"guild_id\":\"902947280162811975\",\"name\":\"work\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1010702591710986240\"}\r\n------WebKitFormBoundaryMcqN0DmNbQHonseA--\r\n`,
			'method': 'POST',
			'mode': 'cors',
		} ).then( async res => {
			
			/** Calculate mean of the day */
			if (isCurrentDay( data.date )) {
				console.log( 'new day'.red() );
				data.total_days_count += 1;
				data.count_mean += ((data.count - data.count_mean) / data.total_days_count);
				data.money_mean += ((data.money - data.money_mean) / data.total_days_count);
				data.money = 0;
				data.count = 0;
			}
			let money = 0;
			let money_mess_date;
			if (res.ok) {
				data.count += 1;
				data.count_total += 1;
				
				/** Fetch money gain */
				await new Promise( resolve => setTimeout( resolve, config.one_second * 5 ) );
				money = await fetch( `https://discord.com/api/v9/channels/905426507021811772/messages?limit=10`, {
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
					
					/** Get the last message > DB date */
					for (const message of json) {
						if (message.author.id === '952125649345196044' && message.interaction.user.id === account.id && message.interaction.name === 'work') {
							money_mess_date = new Date( message.timestamp );
							money_mess_date.setMilliseconds(0);
							console.log( `Money message ${money_mess_date === data.date} ${getLocaleDateString(money_mess_date).cyan()}, UTC ${money_mess_date.getTime()} | Last in DB ${getLocaleDateString(data.date).cyan()}, UTC ${data.date.getTime()} | Gain : ${parseInt( message.content.split( '**' )[1] )} | Date : ${getLocaleDateString()}` );
							if (money_mess_date > data.date) return parseInt( message.content.split( '**' )[1] );
							else if (money_mess_date === data.date) return money_mess_date;
						}
					}
					return 0;
					
				} ) );
			}
			if ( money instanceof Date) {
				const timeout = 60 - (new Date() - money_mess_date) / config.one_minute;
				console.log(account.id.red(), 'has already worked, waiting', timeout.toFixed(0), 'mins');
				return work_cant_c_me( account, data, timeout * config.one_minute );
			
			} else if (money && res.ok && money_mess_date) {
				data.date = money_mess_date;
				data.money_total += money;
				data.money += money;
				
				console.log( `${account.id.green()} | Money: ${data.money.toString().blue()} | Mean: ${data.money_mean} | Gain: ${money.toString().green()} | Count: ${data.count} | Date: ${money_mess_date}` );
				
				const timeout = config.work_interval + config.cooldown * Math.random();
				await saveData( data, account.id, money_mess_date );
				return work_cant_c_me( account, data, timeout );
				
			} else {
				console.warn( `${account.id.red()} failed ( ${fetchResFormat( res )} | Gain: ${money === 0 ? money.toString().red() : money.toString().green()} | Error: ${data.error} | Date: ${getLocaleDateString()} )` );
				data.error += 1;
				return work_retry( account, data );
			}
		} );
	} catch (e) {
		console.error( 'Work has crashed'.red(), e );
		data.error += 1;
		return work_retry( account, data );
	}
	
}
