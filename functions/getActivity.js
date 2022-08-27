import fetch from 'node-fetch';
import accounts from '../data/accounts.js';

/**
 * @name getActivity
 * @description activity of the channel from 0 to 10, 0 is inactive, 10 is very active
 *
 * @param account the account
 * @return {Promise<number>} the message count of others since the last money message
 */
export default async function getActivity(account) {
	const workers = (() => {
		let workers = [];
		accounts.forEach( worker => {if (worker.id !== account.id) workers.push( worker.id );} );
		return workers;
	})();
	return await fetch( `https://discord.com/api/v9/channels/905426507021811772/messages?limit=10`, {
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
	} ).then( res => res.json().then( async json => {
		let activity = 0;
		
		for (const message of json) {
			if (message.author.id === '952125649345196044' && message.interaction.user.id === account.id && message.interaction.name === 'work') {
				return activity;
			} else if (!(message.author.id === '952125649345196044' && workers.includes( message.interaction.user.id ) && message.interaction.name === 'work')) {
				activity++;
			}
		}
		
		return activity;
	} ) );
}