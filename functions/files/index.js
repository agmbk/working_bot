const fs = require('fs');


/**
 * List all the ignored files in a gitignore
 * @param {string} gitignorePath
 * @returns {string[]}
 */
module.exports.gitignoreList = (gitignorePath) => fs.readFileSync(gitignorePath + '/.gitignore', 'utf-8').split('\r\n').filter(e => e[0] !== '#' && e);

/**
 * Create a directory recursively if it doesn't exist
 * @param {string} dir
 */
module.exports.createDirRec = (dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
};

/**
 * Check if the string is blacklisted
 * @param {array} exclude
 * @param {string} string
 * @returns {boolean}
 */
module.exports.notExcluded = (exclude, string) => exclude.every(e => {
	const res = !string.match(`^${e
		.replaceAll('.', '[.]')
		.replaceAll('*', '.*')
		.replaceAll('/', '')
		.replaceAll('\\', '')
		.replaceAll('\\?', '.*').replace('only:', '')
	}$`);
	return e.slice(0, 5) === 'only:' ? !res : res;
});


/**
 * Returns all files path in a list = require(a directory
 * To include only files ending with .png use ['only:*.png']
 * @name getFilesOfDir
 * @param {string} dir The directory
 * @param {['only:' | string]} exclude Excluded names
 * @param {array} files
 * @param excludeOnlyFiles
 * @return {string[]}
 */
module.exports.getFilesOfDir = (dir, exclude = [], excludeOnlyFiles = false, files = []) => {
	for (const dirElement of fs.readdirSync(dir)) {
		
		const _path = dir + '/' + dirElement;
		
		if (fs.statSync(_path).isDirectory() && (excludeOnlyFiles || module.exports.notExcluded(exclude, dirElement))) {
			module.exports.getFilesOfDir(_path, exclude, excludeOnlyFiles, files);
		} else if (dirElement[0] !== '_' && module.exports.notExcluded(exclude, dirElement)) {
			files.push(_path);
		}
	}
	
	return files;
};
