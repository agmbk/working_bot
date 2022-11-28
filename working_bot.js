process.env.TZ = 'Europe/Paris';
const accounts = require('./data/accounts.js');
const mainAccount = require('./data/mainAccount.js');
require('./data/color.js');
const WorkHandler = require('./functions/work.js');


(async () => {
	const data = await require('./data/databaseInit.js');
	try {
		/** DB data */
		
		console.log('*** Database data ***'.blue(), data);
		
		/** Workers */
		
		console.log('*** Workers start-up ***'.blue());
		
		/** Pay
	accounts.map( account => {
		if (account.pay && Math.random() < 0.2 && !config.night.includes( getLocaleDate().getHours() )) {
			console.log( `${account.id.cyan()} is paying ${mainAccount.id.cyan()}` );
			setTimeout( () => pay( account, mainAccount ), config.one_hour );
		}
	} );
		 */
		
		/** Work */
		accounts.map(async (account, id) => {
			if (account.id === mainAccount.id) new WorkHandler(account, data[id]);
		});
		
		setTimeout(() => console.log('*** Work result ***'.blue()), 0);
		
	} catch (e) {
		console.error('GLOBAL CRASH'.red(), e);
	}
})();
