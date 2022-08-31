import config from './config.json' assert { type: 'json' };
import data from './data/databaseData.js';
import accounts from './data/accounts.js';
import mainAccount from './data/mainAccount.js';
import pay from './functions/pay.js';
import './data/color.js';
import workHandler from './functions/work.js';
import { getLocaleDate } from './functions/dateHandler.js';


try {
	/** DB data */
	
	console.log( '*** Database data ***'.blue(), data );
	
	/** Workers */
	
	console.log( '*** Workers start-up ***'.blue() );
	
	/** Pay */
	accounts.map( account => {
		if (account.pay && Math.random() < 0.2 && !config.night.includes( getLocaleDate().getHours() )) {
			console.log( `${account.id.cyan()} is paying ${mainAccount.id.cyan()}` );
			setTimeout( () => pay( account, mainAccount ), config.one_hour );
		}
	} );
	
	/** Work */
	accounts.map( async (account, id) => {
		new workHandler( account, data[id] );
	} );
	
	setTimeout( () => console.log( '*** Work result ***'.blue() ), 0 );
	
} catch (e) {
	console.error( 'GLOBAL CRASH'.red(), e );
}
