/**
 * @name getDate
 * @description Get french date, formatted in en-US for DB compatibility
 *
 * @returns {string} date to string
 */
export default function getDate(date = '') {
	if (date.length) {
		return new Date( date ).toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
	} else {
		return new Date().toLocaleString( 'en-US', {timeZone: 'Europe/Paris'} );
	}
}
