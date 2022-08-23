import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import mainAccount from './data/mainAccount.js';
import getDate from './functions/getDate.js';
import work from './functions/work.js';
// import pay from './functions/pay.js';
import './data/Color.js';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue() );
	
	console.log( data );
	
	/** Workers */
	
	console.log( '*** Workers start-up ***'.blue() );
	
	/* Pay */
	accounts.map( account => {
		if (account.pay) {
			// console.log( `${account.id.cyan()} is paying ${mainAccount.id.cyan()}` );
			// setTimeout( () => pay( account, mainAccount ), one_hour );
		}
	} );
	
	/* Work */
	accounts.map( (account, id) => {
		const account_data = data[id];
		
		if (account.id === mainAccount.id) {
			const wait_time = 60 - (Date.parse( getDate() ) - account_data.date.getTime()) / config.one_minute;
			
			if (wait_time > 0) {
				const timeout = wait_time * config.one_minute + config.cooldown * Math.random();
				console.log( `${account.id.cyan()} will works in ${wait_time.toFixed( 0 ).cyan()} mins | Date: ${getDate()}` );
				
				work( account, account_data, timeout );
				
			} else {
				console.log( `${account.id.cyan()} will works now | Date: ${getDate()}` );
				work( account, account_data, 0 );
			}
		}
	} );
	
	console.log( '*** Work result ***'.blue() );
	
} catch (e) {
	/* Can be DB error */
	console.error( 'GLOBAL CRASH'.red(), e );
}
