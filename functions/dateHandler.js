/**
 * @name getDate
 * @exports
 * @description Get french date, formatted in en-US for Postgres
 * @param {Date || string} date
 * @returns {string} date to string
 */
export function getDate(date = null) {
	let result;
	if (arguments.length === 1) {
		if (typeof date == 'string') {
			result = new Date( Date.parse( date ) ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
			
		} else if (date instanceof Date || date instanceof 'number') {
			result = new Date( date ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
			
		} else {
			throw new Error( `Invalid date: ${date}` );
			
		}
	} else if (arguments.length) {
		throw new Error( 'Too many arguments' );
		
	} else {
		result = new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
		
	}
	if (result === 'Invalid Date') {
		throw new Error( 'Invalid Date' );
		
	} else {
		return result;
	}
}

/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date || string} date
 * @returns {boolean}
 */
export function isCurrentDay(date) {
	let compared_date;
	if (typeof date == 'string') {
		compared_date = new Date( Date.parse( date ) );
		
	} else if (date instanceof Date || date instanceof 'number') {
		compared_date = new Date( date );
		
	} else {
		throw new Error( 'Invalid type' );
	}
	
	const current_date = new Date( Date.parse( getDate() ) );
	
	return compared_date.getDate() !== current_date.getDate() || compared_date.setDate( compared_date.getDate() + 1 ) < current_date.getTime() || compared_date.setDate( compared_date.getDate() - 2 ) > current_date.getTime();
}
