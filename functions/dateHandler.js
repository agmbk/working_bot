/**
 * @name getDate
 * @exports
 * @description Get french date, formatted in en-US for Postgres
 * @returns {string} date to string
 */
export function getDate(date) {
	let result;
	
	if (arguments.length > 1) {
		throw new Error( 'Too many arguments' );
		
	} else if (arguments.length === 1 && arguments[0]) {
		result = new Date( date ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
		
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
 * @name getUTCDate
 * @exports
 * @description Get french date, to UTC string
 * @returns {string} date to string
 */
export function getUTCDateString(date) {
	return new Date(date.setUTCDate(1)).toUTCString();
}

/**
 * @name getUTCDate
 * @exports
 * @description Get french date, to UTC Date
 * @returns {Date} date to Date
 */
export function getUTCDate(date) {
	console.log('getUTCDate', date.setUTCDate(1));
	return date
}

/**
 * @name getDateObject
 * @exports
 * @description Get french date Object
 * @param {Date || string || number} date
 * @returns {Date} date to Date
 */
export function getDateObject(date = '') {
	return new Date( Date.parse( getDate( date ) ) );
}


/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date} date
 * @returns {boolean}
 */
export function isCurrentDay(date) {
	const compared_date = getDateObject( date );
	const current_date = getDateObject();
	console.log( 'isCurrentDay'.red(), 'date', date, '1', compared_date, '2', current_date, compared_date.getDate(), current_date.getDate(), compared_date.getMonth(), current_date.getMonth(), compared_date.getFullYear(), current_date.getFullYear() );
	return !(
		compared_date.getDate() === current_date.getDate() &&
		compared_date.getMonth() === current_date.getMonth() &&
		compared_date.getFullYear() === current_date.getFullYear());
}
