import config from '../config.json' assert { type: 'json' };

/**
 * @name getLocaleDate
 * @exports
 * @description Get french date, //formatted in en-US for Postgres
 * @returns {Date} date to string
 */
export function getLocaleDate(date) {
	let result;
	if (arguments.length === 1 && arguments[0]) {
		result = new Date( date ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
	} else {
		result = new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
	}
	result = new Date(result);
	if (!(result instanceof Date)) {
		throw new Error( `Invalid date: ${date}` );
	}
	return result;
}

/**
 * @name getUTCDate
 * @exports
 * @description Get french date, to UTC Date
 * @returns {Date} date to Date
 */
export function getUTCDateToLocale(date) {
	date.setTime( date.getTime() -config.timezone_offset*60000 )
	return date;
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
