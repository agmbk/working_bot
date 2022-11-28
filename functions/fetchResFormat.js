module.exports = function (res) {
	return `OK: ${res.ok ? res.ok.toString().green() : res.ok.toString().red()} | Status: ${res.status === 204 ? `${res.status} ${res.statusText}`.green() : `${res.status} ${res.statusText}`.red()}`;
};

module.exports = (res) => `OK: ${res.ok ? res.ok.toString().green() : res.ok.toString().red()} | Status: ${res.status === 204 ? `${res.status} ${res.statusText}`.green() : `${res.status} ${res.statusText}`.red()}`;