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
 * @returns {string} date to date
 */
export function getLocaleDateString(date) {
	return getLocaleDate( date ).toLocaleString( 'fr-EU' );
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
	return !(
		compared_date.getDate() === current_date.getDate() &&
		compared_date.getMonth() === current_date.getMonth() &&
		compared_date.getFullYear() === current_date.getFullYear());
}
