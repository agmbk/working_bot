import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import mainAccount from './data/mainAccount.js';
import { getLocaleDateString } from './functions/dateHandler.js';
import work, { work_cant_c_me } from './functions/work.js';
import pay from './functions/pay.js';
import './data/color.js';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue(), data );
	
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
		const account_data = data[id];
		const wait_time = 60 - (new Date() - account_data.date) / config.one_minute;
		
		if (wait_time > 0) {
			const timeout = wait_time * config.one_minute;
			console.log( `${account.id.cyan()} can works in ${wait_time.toFixed( 0 ).cyan()} mins | Date: ${getLocaleDateString()}` );
			work_cant_c_me( account, account_data, timeout );
			
		} else {
			console.log( `${account.id.cyan()} can works now | Date: ${getLocaleDateString()}` );
			work( account, account_data );
		}
	} );
	
	console.log( '*** Work result ***'.blue() );
	
} catch (e) {
	console.error( 'GLOBAL CRASH'.red(), e );
}
