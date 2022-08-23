import accounts from './accounts.js';


export default accounts.find( account => account.pay === false );
