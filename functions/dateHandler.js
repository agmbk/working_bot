/**
 * @name getDate
 * @exports
 * @description Get french date, formatted in en-US for Postgres
 * @param {Date || string} date
 * @returns {string} date to string
 */
export function getDate(date) {
	let result;
	
	if (arguments.length > 1) {
		throw new Error( 'Too many arguments' );
		
	} else if (arguments.length === 1 && arguments[0].length) {
		if (typeof date == 'string') {
			result = new Date( Date.parse( date ) ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
			
		} else if (date instanceof Date || typeof date === 'number') {
			result = new Date( date ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
			
		} else {
			throw new Error( `Invalid date: ${date}` );
			
		}
	} else {
		result = new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
		
	}
	if (result === 'Invalid Date') {
		throw new Error( `Invalid date: ${date}` );
		
	} else {
		return result;
	}
}

/**
 * @name getDateObject
 * @exports
 * @description Get french date Object
 * @param {Date || string} date
 * @returns {Date} date to Date
 */
export function getDateObject(date = '') {
	return new Date( Date.parse( getDate( date ) ) );
}

/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date || string} date
 * @returns {boolean}
 */
export function isCurrentDay(date) {
	let compared_date = getDateObject( date ), current_date = getDateObject();
	console.log('isCurrentDay', compared_date, current_date);
	return !!(
			compared_date.getDate() !== current_date.getDate() ||
			compared_date.getMonth() < current_date) ||
		compared_date.setDate( compared_date.getDate() - 2 ) > current_date;
}

/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date || string} date
 * @returns {boolean}

export function isCurrentDay(date) {
	let compared_date = getDateObject( date ), current_date = getDateObject();
	return (
		compared_date.getDate() === current_date.getDate() &&
		compared_date.getMonth() === current_date.getMonth()) &&
		compared_date.getFullYear() === current_date.getFullYear();
}
 */