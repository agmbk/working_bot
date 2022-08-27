import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import mainAccount from './data/mainAccount.js';
import { getLocaleDate, getLocaleDateString } from './functions/dateHandler.js';
import work from './functions/work.js';
import pay from './functions/pay.js';
import './data/color.js';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue(), data, new Date(new Date('Sun Aug 28 2022 00:45:39 GMT+0000'.split('GMT')[0]).toJSON()).toUTCString(), getLocaleDate(new Date('Sun Aug 28 2022 00:45:39 GMT+0000'.split('GMT')[0]).toJSON()).toUTCString());
	
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
	accounts.map( (account, id) => {
		const account_data = data[id];
		const wait_time = 60 - (getLocaleDate().getTime() - account_data.date.getTime()) / config.one_minute;
		console.log(wait_time, getLocaleDate(wait_time),  getLocaleDate(),account_data.date );
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
