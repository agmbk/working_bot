/**
 * @name getLocaleDate
 * @exports
 * @description Get french date
 * @returns {Date} date to date
 */
module.exports.getLocaleDate = (date) => {
	let result_date;
	if (arguments.length === 1 && arguments[0]) {
		result_date = new Date(date);
	} else {
		result_date = new Date();
	}
	result_date = new Date(result_date.toLocaleString('en-US', {timeZone: 'Europe/Paris'}));
	if (!(result_date instanceof Date)) {
		throw new Error(`Invalid date: ${date}`.red());
	}
	return result_date;
};

/**
 * @name getLocaleDateString
 * @exports
 * @description Get french date to string
 * @returns {string} date to date
 */
module.exports.getLocaleDateString = (date) => {
	return module.exports.getLocaleDate(date).toLocaleString('fr-EU');
};

/**
 * @name isCurrentDay
 * @exports
 * @description Check if a date is the same day as the current date
 * @param {Date} date
 * @returns {boolean}
 */
module.exports.isCurrentDay = (date) => {
	const compared_date = module.exports.getLocaleDate(date);
	const current_date = module.exports.getLocaleDate();
	return !(
		compared_date.getDate() === current_date.getDate() &&
		compared_date.getMonth() === current_date.getMonth() &&
		compared_date.getFullYear() === current_date.getFullYear());
};
