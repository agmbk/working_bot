import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import { getLocaleDate, getLocaleDateString } from './functions/dateHandler.js';
import work from './functions/work.js';
import pay from './functions/pay.js';
import mainAccount from './data/mainAccount.js';
import './data/color.js';
import getActivity from './functions/getActivity.js';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue(), data );
	
	/** Workers */
	
	console.log( '*** Workers start-up ***'.blue() );
	
	/* Pay */
	accounts.map( account => {
		if (account.pay) {
			console.log( `${account.id.cyan()} is paying ${mainAccount.id.cyan()}` );
			setTimeout( () => pay( account, mainAccount ), config.one_hour );
		}
	} );
	
	/* Work */
	accounts.map( (account, id) => {
		const account_data = data[id];
		console.log( getActivity( account ) );
		console.log( 'account_data.date'.red(), account_data.date );
		const wait_time = 60 - getLocaleDate() - (account_data.date / config.one_minute);
		
		if (wait_time > 0) {
			const timeout = wait_time * config.one_minute + config.cooldown * Math.random();
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
