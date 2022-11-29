const config = require('../config.json');
const fetch = require('node-fetch');
const {getLocaleDate, getLocaleDateString, isCurrentDay} = require('./dateHandler.js');
const getActivity = require('./getActivity.js');
const fetchResFormat = require('./fetchResFormat.js');
const saveData = require('./saveData.js');
require('../data/color.js');

/**
 * @author 🅣 🅞 🅚 🅐#9652
 * @class
 * @name WorkHandler
 * @export WorkHandler
 * @description Start a working instance for a given account
 *
 * @param account
 * @param data
 */
module.exports = class WorkHandler {
	day = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
	retryCount = 0;
	retryTimeout;
	
	constructor(account, data) {
		this.data = data;
		this.authorization = account.authorization;
		this.pay = account.pay;
		this.id = account.id;
		this.session_id = account.session_id;
		this.startup();
	}
	
	/**
	 * @name log
	 * @description Console log a string with the prefix of the account id
	 */
	log() {
		const string = Object.values(arguments).toString();
		this.pay ? console.log(this.id.toString().cyan(), string) : console.log(this.id.toString().yellow(), string);
	}
	
	/**
	 * @name startup
	 * @description Init activity and handle errors
	 */
	startup() {
		try {
			this.log('successfully started'.green());
			console.log(this.data);
			const timeout = config.one_hour - (new Date() - this.data.date);
			setTimeout(() => timeout > 0 ? this.wait(timeout, 'startup') : this.workActivity(), config.one_second * 3);
			
		} catch (e) {
			this.log('WorkHandler has crashed'.red(), e);
			this.startup();
		}
	}
	
	/**
	 * @name workActivity
	 * @description Start working according to the activity
	 */
	workActivity() {
		getActivity(this.id, this.authorization).then(activity => {
			if (this.pay) {
				if (activity < 6 && this.day.includes(getLocaleDate().getHours()) || !this.day.includes(getLocaleDate().getHours()) && this.getChance(40)) {
					return this.workRetry('activity '.red() + activity);
				}
			} else {
				if (activity < 1 && this.getChance(70) || !this.day.includes(getLocaleDate().getHours())) {
					return this.workRetry('activity '.red() + activity);
				}
			}
			this.work(activity);
		});
	}
	
	/**
	 * @name work
	 * @description Fetch /work
	 */
	work(activity) {
		this.log('work', activity.toString().green());
		
		fetch('https://discord.com/api/v9/interactions', {
			'headers': {
				'accept': '*/*',
				'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
				'authorization': this.authorization,
				'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary0N5zB8dsce5O8Lab',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'x-debug-options': 'bugReporterEnabled',
				'x-discord-locale': 'en-GB',
				'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImZyLUZSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwNi4wLjUyNDkuMTE5IFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMDYuMC41MjQ5LjExOSIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiJodHRwczovL3d3dy55b3V0dWJlLmNvbS8iLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiJ3d3cueW91dHViZS5jb20iLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjoxNjA2NDUsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9',
				'cookie': '__dcfduid=dbadf91046ff11ed8f826dbaeacdbf67; __sdcfduid=dbadf91146ff11ed8f826dbaeacdbf6754d9b4d6e41fca9f89fca6f61ecbb5c6f43ea2ebd434c57a77bf18288b6ab492; __stripe_mid=f304ec95-7e45-4ce0-81cb-c1cd21b631a32958b7; locale=en-GB',
				'Referer': 'https://discord.com/channels/902947280162811975/905426507021811772',
				'Referrer-Policy': 'strict-origin-when-cross-origin'
			},
			'body': `------WebKitFormBoundary0N5zB8dsce5O8Lab\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${this.session_id}\",\"data\":{\"version\":\"1001148798988472382\",\"id\":\"1001148798988472381\",\"guild_id\":\"902947280162811975\",\"name\":\"work\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1046920100218667008\"}\r\n------WebKitFormBoundary0N5zB8dsce5O8Lab--\r\n`,
			'method': 'POST'
		}).then(res => {
			if (res.ok) {
				setTimeout(() => this.getMoney(), config.one_second * 5);
			} else {
				this.workRetry('/work failed '.red() + fetchResFormat(res));
			}
		});
	}
	
	/**
	 * @name getMoney
	 * @description Fetch money gain = require(work
	 */
	getMoney() {
		
		/** Fetch money gain */
		fetch(`https://discord.com/api/v9/channels/905426507021811772/messages?limit=10`, {
			'headers': {
				'accept': '*/*',
				'accept-language': 'fr,fr-FR;q=0.9',
				'authorization': this.authorization,
				'content-type': 'multipart/form-data',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'x-debug-options': 'bugReporterEnabled',
				'x-discord-locale': 'en-GB'
			},
			'referrer': 'https://discord.com/channels/902947280162811975/905426507021811772',
			'referrerPolicy': 'strict-origin-when-cross-origin',
			'body': null,
			'method': 'GET',
			'mode': 'cors'
		}).then(res => res.json().then(json => {
			
			/** Get the last message > DB date */
			for (const message of json) {
				if (message.author.id === '952125649345196044' && message.interaction.user.id === this.id && message.interaction.name === 'work') {
					const money_mess_date = new Date(message.timestamp);
					money_mess_date.setMilliseconds(0);
					// this.log( `Money message ${money_mess_date === this.data.date} ${getLocaleDateString( money_mess_date ).cyan()} | Last in DB ${getLocaleDateString( this.data.date ).cyan()} | Gain : ${parseInt( message.content.split( '**' )[1] )} | Date : ${getLocaleDateString()}` );
					
					if /** Work is a success */ (money_mess_date > this.data.date) {
						
						this.isNewDay();
						const money = parseInt(message.content.split('**')[1]);
						this.data.count += 1;
						this.data.count_total += 1;
						this.data.money_total += money;
						this.data.money += money;
						this.data.date = money_mess_date;
						saveData(this.data, this.id, money_mess_date);
						return this.wait(config.work_interval + config.cooldown, `Money: ${this.data.money.toString().blue()} | Mean: ${this.data.money_mean} | Gain: ${money.toString().green()} | Count: ${this.data.count}`);
						
					} else if /** Work has already been done */ (money_mess_date === this.data.date) {
						
						const timeout = 60 - (new Date() - money_mess_date);
						return this.wait(timeout, 'the work has already been done');
						
					} else /** Work failed */ {
						
						this.data.error += 1;
						return this.workRetry(`Gain not found | Error: ${this.data.error}`.red());
					}
				}
			}
		}));
	}
	
	/**
	 * @name workRetry
	 * @description Retry working after a timeout
	 */
	workRetry(string) {
		this.retryCount++;
		this.retryCount >= 6 ? this.retryTimeout = config.one_hour : this.retryTimeout = config.retry;
		this.wait(this.retryTimeout, string);
	}
	
	/**
	 * @name isNewDay
	 * @description Calculate data means and reset some data each new day
	 */
	isNewDay() {
		if (isCurrentDay(this.data.date)) {
			this.data.total_days_count += 1;
			this.data.count_mean += ((this.data.count - this.data.count_mean) / this.data.total_days_count);
			this.data.money_mean += ((this.data.money - this.data.money_mean) / this.data.total_days_count);
			this.data.money = 0;
			this.data.count = 0;
		}
	}
	
	/**
	 * @name wait
	 * @description Waits a certain amount of time, then works
	 */
	wait(timeout, reason) {
		timeout += config.cant_c_me * Math.random();
		let working_at = new Date();
		working_at.setMilliseconds(working_at.getMilliseconds() + timeout);
		this.log(`waiting ${this.getMins(timeout).toString().cyan()} mins until ${getLocaleDateString(working_at).cyan()} | ${reason} | Date : ${getLocaleDateString()}`);
		setTimeout(() => this.workActivity(), timeout);
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to hours
	 */
	getHours(milliseconds) {
		return (milliseconds / config.one_hour).toFixed(0);
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to minutes
	 */
	getMins(milliseconds) {
		return (milliseconds / config.one_minute).toFixed(0);
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to secondes
	 */
	getSecs(milliseconds) {
		return (milliseconds / config.one_second).toFixed(0);
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to hours
	 */
	getChance(percent) {
		return Math.random() <= percent / 100;
	}
};
