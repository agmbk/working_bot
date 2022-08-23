// light '\u001b[31;2m' + this + '\u001b[0m'
// bright '\u001b[31;1m' + this + '\u001b[0m'
// underline '\u001b[31;4m' + this + '\u001b[0m'
// highlight '\u001b[31;7m' + this + '\u001b[0m'


/**
 * @name red
 * @description Colors the string to red
 *
 * @returns {string}
 */
String.prototype.red = function () {
	return '\u001b[31;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to green
 *
 * @returns {string}
 */
String.prototype.green = function () {
	return '\u001b[32;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to yellow
 *
 * @returns {string}
 */
String.prototype.yellow = function () {
	return '\u001b[33;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to blue
 *
 * @returns {string}
 */
String.prototype.blue = function () {
	return '\u001b[34;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to purple
 *
 * @returns {string}
 */
String.prototype.purple = function () {
	return '\u001b[35;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to cyan
 *
 * @returns {string}
 */
String.prototype.cyan = function () {
	return '\u001b[36;1m' + this + '\u001b[0m';
};

/**
 * @name red
 * @description Colors the string to grey
 *
 * @returns {string}
 */
String.prototype.grey = function () {
	return '\u001b[37;1m' + this + '\u001b[0m';
};


export default String;
