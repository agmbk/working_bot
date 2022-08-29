import config from '../config.json' assert { type: 'json' };
import fetch from 'node-fetch';
import { getLocaleDate, getLocaleDateString, isCurrentDay } from './dateHandler.js';
import getActivity from './getActivity.js';
import fetchResFormat from './fetchResFormat.js';
import saveData from './saveData.js';
import '../data/color.js';


export default class workHandler {
	day = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
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
		const string = Object.values( arguments ).toString();
		this.pay ? console.log( this.id.toString().cyan(), string ) : console.log( this.id.toString().blue(), string );
	}
	
	/**
	 * @name startup
	 * @description Init activity and handle errors
	 */
	startup() {
		try {
			this.log( 'successfully started' );
			const timeout = config.one_hour - (new Date() - this.data.date);
			timeout > 0 ? this.wait( timeout, 'startup' ) : this.workActivity();
			
		} catch (e) {
			this.log( 'workHandler has crashed'.red(), e );
			//this.startup();
		}
	}
	
	/**
	 * @name workActivity
	 * @description Start working according to the activity
	 */
	workActivity() {
		this.log( 'workActivity' );
		getActivity( this.id, this.authorization ).then( activity => {
			
			if (!this.pay) {
				if ((activity < 1 && !this.day.includes( getLocaleDate().getHours() )) || (activity < 1 && !(this.day.includes( getLocaleDate().getHours() ) && this.getChance( 10 )))) {
					return this.workRetry( 'activity '.red() + activity );
				}
			} else {
				if (activity <= 6) {
					return this.workRetry( 'activity '.red() + activity );
				}
			}
			this.work( activity );
		} );
	}
	
	/**
	 * @name work
	 * @description Fetch /work
	 */
	work(activity) {
		this.log( 'work', activity.toString().green() );
		
		fetch( 'https://discord.com/api/v9/interactions', {
			'headers': {
				'accept': '*/*',
				'accept-language': 'fr,fr-FR;q=0.9',
				'authorization': this.authorization,
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
			'body': `------WebKitFormBoundaryMcqN0DmNbQHonseA\r\nContent-Disposition: form-data; name=\"payload_json\"\r\n\r\n{\"type\":2,\"application_id\":\"952125649345196044\",\"guild_id\":\"902947280162811975\",\"channel_id\":\"905426507021811772\",\"session_id\":\"${this.session_id}\",\"data\":{\"version\":\"1001148798988472382\",\"id\":\"1001148798988472381\",\"guild_id\":\"902947280162811975\",\"name\":\"work\",\"type\":1,\"options\":[],\"attachments\":[]},\"nonce\":\"1010702591710986240\"}\r\n------WebKitFormBoundaryMcqN0DmNbQHonseA--\r\n`,
			'method': 'POST',
			'mode': 'cors',
		} ).then( async res => {
			if (res.ok) {
				setTimeout( () => this.getMoney(), config.one_second * 10 );
			} else {
				this.workRetry( '/work failed '.red() + fetchResFormat( res ) );
			}
		} );
	}
	
	/**
	 * @name getMoney
	 * @description Fetch money gain from work
	 */
	getMoney() {
		this.log( 'getMoney' );
		
		/** Fetch money gain */
		fetch( `https://discord.com/api/v9/channels/905426507021811772/messages?limit=10`, {
			'headers': {
				'accept': '*/*',
				'accept-language': 'fr,fr-FR;q=0.9',
				'authorization': this.authorization,
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
				if (message.author.id === '952125649345196044' && message.interaction.user.id === this.id && message.interaction.name === 'work') {
					const money_mess_date = new Date( message.timestamp );
					money_mess_date.setMilliseconds( 0 );
					this.log( `Money message ${money_mess_date === this.data.date} ${getLocaleDateString( money_mess_date ).cyan()}, UTC ${money_mess_date.getTime()} | Last in DB ${getLocaleDateString( this.data.date ).cyan()}, UTC ${this.data.date.getTime()} | Gain : ${parseInt( message.content.split( '**' )[1] )} | Date : ${getLocaleDateString()}` );
					
					if /** Work is a success */ (money_mess_date > this.data.date) {
						
						this.isNewDay();
						const money = parseInt( message.content.split( '**' )[1] );
						this.data.count += 1;
						this.data.count_total += 1;
						this.data.money_total += money;
						this.data.money += money;
						this.data.date = money_mess_date;
						saveData( this.data, this.id, money_mess_date );
						return this.wait( config.work_interval + config.cooldown, `Money: ${this.data.money.toString().blue()} | Mean: ${this.data.money_mean} | Gain: ${money.toString().green()} | Count: ${this.data.count}` );
						
					} else if /** Work has already been done */ (money_mess_date === this.data.date) {
						
						const timeout = 60 - (new Date() - money_mess_date);
						return this.wait( timeout, 'the work has already been done' );
						
					} else /** Work failed */ {
						
						this.data.error += 1;
						return this.workRetry( `Gain not found | Error: ${this.data.error}`.red() );
					}
				}
			}
		} ) );
	}
	
	/**
	 * @name workRetry
	 * @description Retry working after a timeout
	 */
	workRetry(string) {
		this.retryCount++;
		if (this.retryCount >= 6) this.retryTimeout = config.one_hour;
		this.retryTimeout = config.retry;
		this.wait( this.retryTimeout, `retry ${this.retryCount} ${this.retryTimeout} | ` + string );
	}
	
	/**
	 * @name isNewDay
	 * @description Calculate data means and reset some data each new day
	 */
	isNewDay() {
		if (isCurrentDay( this.data.date )) {
			this.log( 'new day'.red() );
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
		working_at.setMilliseconds( working_at.getMilliseconds() + timeout );
		this.log( `waiting ${this.getMins( timeout ).toString().cyan()} mins until ${getLocaleDateString( working_at ).cyan()} | ${reason} | Date : ${getLocaleDateString()}` );
		setTimeout( () => this.workActivity(), timeout );
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to hours
	 */
	getHours(milliseconds) {
		return (milliseconds / config.one_hour).toFixed( 0 );
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to minutes
	 */
	getMins(milliseconds) {
		return (milliseconds / config.one_minute).toFixed( 0 );
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to secondes
	 */
	getSecs(milliseconds) {
		return (milliseconds / config.one_second).toFixed( 0 );
	}
	
	/**
	 * @name getHours
	 * @description Transform milliseconds to hours
	 */
	getChance(percent) {
		return Math.random() <= percent / 100;
	}
}
