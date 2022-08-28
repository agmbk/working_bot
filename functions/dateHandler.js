import config from '../config.json' assert { type: 'json' };

/**
 * @name getLocaleDate
 * @exports
 * @description Get french date
 * @returns {Date} date to date
 */
export function getLocaleDate(date) {
	let result_date;
	if (arguments.length === 1 && arguments[0]) {
		result_date = new Date( date );
	} else {
		result_date = new Date();
	}
	result_date = new Date( result_date.toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} ) );
	if (!(result_date instanceof Date)) {
		throw new Error( `Invalid date: ${date}`.red() );
	}
	return result_date;
}

/**
 * @name getLocaleDateString
 * @exports
 * @description Get french date to string
 * @returns {string} date to string
 */
export function getLocaleDateString(date) {
	return getLocaleDate( date ).toLocaleString( 'fr-EU' );
}

/**
 * @name getUTCDate
 * @exports
 * @description Get french date, to UTC Date
 * @returns {Date} date to Date
 */
export function getUTCDateToLocale(date) {
	date.setTime( date.getTime() - config.timezone_offset * 60000 );
	return date;
}

/**
 * @name getMessageUTCDate
 * @exports
 * @description Get discord message date, to UTC Date
 * @returns {string} date to UTC string
 */
export function getMessageUTCDate(date) {
	console.log(getLocaleDate(date), getLocaleDate(date).toUTCString(), getLocaleDate(date.toString().replace('GMT+0000', 'GMT+0200')).toUTCString() );
	return new Date(date.toString().replace('GMT+0000', 'GMT+0200')).toUTCString()
}

/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date} date
 * @returns {boolean}
 */
export function isCurrentDay(date) {
	const compared_date = getLocaleDate( date );
	const current_date = getLocaleDate();
	console.log( 'isCurrentDay'.red(), 'date', date, '1', compared_date, '2', current_date );
	return !(
		compared_date.getDate() === current_date.getDate() &&
		compared_date.getMonth() === current_date.getMonth() &&
		compared_date.getFullYear() === current_date.getFullYear());
}
