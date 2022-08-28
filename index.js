import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import mainAccount from './data/mainAccount.js';
import { getLocaleDate, getLocaleDateString, getMessageUTCDate, getUTCDateToLocale } from './functions/dateHandler.js';
import work from './functions/work.js';
import pay from './functions/pay.js';
import './data/color.js';
import fetch from 'node-fetch';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue(), data);
	
	/** Workers */
	
	console.log( '*** Workers start-up ***'.blue() );
	
	/** Pay */
	accounts.map( account => {
		if (account.pay) {
			console.log( `${account.id.cyan()} is paying ${mainAccount.id.cyan()}` );
			setTimeout( () => pay( account, mainAccount ), config.one_hour * 72 );
		}
	} );
	
	/** Work */
	accounts.map( async (account, id) => {
		let money_mess_date;
		await fetch( `https://discord.com/api/v9/channels/905426507021811772/messages?limit=10`, {
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
					money_mess_date = getLocaleDate( message.timestamp );
					console.log( `Money message ${money_mess_date} (${parseInt( message.content.split( '**' )[1] )} | Date : ${getLocaleDateString()}), Last in DB ${data.date}` );
					if (money_mess_date > data.date) return parseInt( message.content.split( '**' )[1] );
				}
			}
			return 0;
			
		} ) );
		console.log( new Date(money_mess_date.toString()).toUTCString().red() );
		
		const account_data = data[id];
		const wait_time = 60 - (getLocaleDate().getTime() - account_data.date.getTime()) / config.one_minute;
		console.log( wait_time, getLocaleDate( wait_time ), getLocaleDate(), account_data.date );
		if (wait_time > 0) {
			const timeout = wait_time * config.one_minute;
			console.log( `${account.id.cyan()} will works in ${wait_time.toFixed( 0 ).cyan()} mins | Date: ${getLocaleDateString()}` );
			work( account, account_data, timeout );
			
		} else {
			console.log( `${account.id.cyan()} will works now | Date: ${getLocaleDateString()}` );
			work( account, account_data, 0 );
		}
	} );
	
	console.log( '*** Work result ***'.blue() );
	
} catch (e) {
	console.error( 'GLOBAL CRASH'.red(), e );
}
