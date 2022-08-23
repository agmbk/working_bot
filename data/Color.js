// light '\u001b[31;2m' + this + '\u001b[0m'
// bright '\u001b[31;1m' + this + '\u001b[0m'
// underline '\u001b[31;4m' + this + '\u001b[0m'
// highlight '\u001b[31;7m' + this + '\u001b[0m'

String.prototype.red = function () {
	return '\u001b[31;1m' + this + '\u001b[0m';
};
String.prototype.green = function () {
	return '\u001b[32;1m' + this + '\u001b[0m';
};
String.prototype.yellow = function () {
	return '\u001b[33;1m' + this + '\u001b[0m';
};
String.prototype.blue = function () {
	return '\u001b[34;1m' + this + '\u001b[0m';
};
String.prototype.purple = function () {
	return '\u001b[35;1m' + this + '\u001b[0m';
};
String.prototype.cyan = function () {
	return '\u001b[36;1m' + this + '\u001b[0m';
};
String.prototype.grey = function () {
	return '\u001b[37;1m' + this + '\u001b[0m';
};


export default String;
