const config = require('../config.json');
const {getLocaleDate} = require('./dateHandler.js');
const fetchResFormat = require('./fetchResFormat.js');
const fetch = require('node-fetch');
const getActivity = require('./getActivity.js');

/**
 * @name pay
 * @description Give all the payer money to a receiver
 *
 * @param {Object} payer Account who pays
 * @param {Object} receiver Account paid
 * @returns {void}
 */
module.exports = async function pay(payer, receiver) {
	
	const activity = await getActivity(payer);
	const timeout = config.one_hour * 2 + config.cant_c_me * Math.random();
	if (activity < 10) {
		setTimeout(() => pay(payer, receiver), timeout);
	}
	
	try {
		const res = await fetch('https://discord.com/api/v9/interactions', {
			'headers': {
				'accept': '*/*',
				'accept-language': 'fr,fr-FR;q=0.9',
				'authorization': payer.authorization,
				'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryAAewkFPiiGspgS7p',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'x-debug-options': 'bugReporterEnabled',
				'x-discord-locale': 'fr'
			},
			'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
			'referrerPolicy': 'strict-origin-when-cross-origin',
			'body': `------WebKitFormBoundaryAAewkFPiiGspgS7p\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${payer.session_id}\",\"data\":{\"version\":\"1000878143072120923\",\"id\":\"1000878143072120922\",\"guild_id\":\"902947280162811975\",\"name\":\"money\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1011078265214861312\"}\r\n------WebKitFormBoundaryAAewkFPiiGspgS7p--`,
			'method': 'POST',
			'mode': 'cors'
		});
		
		if (res.ok) {
			
			await new Promise(resolve => setTimeout(resolve, 5e3));
			const messages = await fetch('https://discord.com/api/v9/channels/905426507021811772/messages?limit=10', {
				'headers': {
					'accept': '*/*',
					'accept-language': 'fr,fr-FR;q=0.9',
					'authorization': payer.authorization,
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-origin',
					'x-debug-options': 'bugReporterEnabled',
					'x-discord-locale': 'en-GB'
				},
				'referrer': 'https://discord.com/channels/902947280162811975/952558030556389466',
				'referrerPolicy': 'strict-origin-when-cross-origin',
				'body': null,
				'method': 'GET',
				'mode': 'cors'
			}).then(res => {
				console.log('money messages'.red(), res.ok, res.status, res.statusText);
				return res.json();
			});
			
			/** Try to get the last payement */
			for (const message of messages) {
				if (message.author.id === '952125649345196044' && message.interaction.user.id === payer.id && message.interaction.name === 'pay') {
					const minutes = ((Date.parse(getLocaleDate()) - Date.parse(message.timestamp)) / config.one_minute).toFixed(0);
					const money = parseInt(message.content.split('**')[1]);
					if (minutes < config.pay_interval / one_minute) {
						console.warn(`${payer.id.green()} | Money laundered ${minutes} mins ago (${money.toString().green()})`);
						setTimeout(() => pay(payer, receiver), config.pay_interval + config.cant_c_me * Math.random());
					}
					
					return;
				}
			}
			
			/** Get money amount = require(messages */
			let money;
			for (const message of messages) {
				if (message.author.id === '952125649345196044' && message.interaction.user.id === payer.id && message.interaction.name === 'money') {
					money = parseInt(message.content.split('**')[1]);
				}
			}
			console.log('money'.red(), money);
			if (money === 0) {
				console.warn(`${payer.id.red()} | Money laundering cancelled : ${'You got no money'.red()} !`);
				setTimeout(() => pay(payer, receiver), config.pay_interval + config.cant_c_me * Math.random());
				return;
			}
			
			if (money) {
				await fetch('https://discord.com/api/v9/interactions', {
					'headers': {
						'accept': '*/*',
						'accept-language': 'fr,fr-FR;q=0.9',
						'authorization': payer.authorization,
						'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarybJ8QMNc6sxequ4mv',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'same-origin',
						'x-debug-options': 'bugReporterEnabled',
						'x-discord-locale': 'fr'
					},
					'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
					'referrerPolicy': 'strict-origin-when-cross-origin',
					'body': `------WebKitFormBoundarybJ8QMNc6sxequ4mv\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n{"type":2,"application_id":"952125649345196044","guild_id":"902947280162811975","channel_id":"905426507021811772","session_id":"1a69649039e71a2487bdc37557c173dc","data":{"version":"1000878228195520584","id":"1000878228195520583","guild_id":"902947280162811975","name":"pay","type":1,"options":[{"type":6,"name":"mention","value":"${receiver.id}"},{"type":10,"name":"money","value":${money}}],"attachments":[]},"nonce":"1010719020845891584"}\r\n------WebKitFormBoundarybJ8QMNc6sxequ4mv--`,
					'method': 'POST',
					'mode': 'cors'
				}).then(res => {
					
					if (res.ok) {
						console.log(`${payer.id.green()} | Money successfully laundered (${money.toString().green()})`);
						
					} else {
						console.warn(`${payer.id.red()} | Money laundering failed, retry in ${config.retry / config.one_minute} mins`);
					}
					return setTimeout(() => pay(payer, receiver), config.pay_interval + config.cant_c_me * Math.random());
				});
			}
		}
		/** Probably invalid account or banned */
		console.error(`${payer.id.red()} fetching money failed (account banned ?) | ${fetchResFormat(res)} | Date: ${getLocaleDate()}`);
		setTimeout(() => pay(payer, receiver), config.retry + config.cant_c_me * Math.random());
		
	} catch (e) {
		console.error('Pay has crashed'.red(), e);
		setTimeout(() => pay(payer, receiver), config.retry + config.cant_c_me * Math.random());
	}
};
