const fs = require('fs');
require('dotenv').config();
const webpack = require('webpack');
const config = require('./webpack.config.js');
const Client = require('ssh2-sftp-client');
const SSH = require('simple-ssh');
const {getFilesOfDir, gitignoreList, createDirRec, notExcluded} = require('./functions/files');
const JavaScriptObfuscate = require('javascript-obfuscator');


const client = new Client();
const output_dir = __dirname + `/vps_setup/working_bot/`;
const vpsDir = '/home/ubuntu/working_bot/discord/';
const rmExclude = ['node_modules', '.env', '*log(s)?', 'data'];

/**
 *
 * @returns {SSH}
 */
function sshConnect() {
	return new SSH({
		host: process.env.VPS_HOST,
		port: process.env.VPS_PORT,
		user: process.env.VPS_USER,
		pass: process.env.VPS_PASSWORD
	});
}

/**
 *
 * @returns {Promise<void>}
 */
function sshScreenSetup() {
	const ssh = sshConnect();
	return new Promise(resolve => ssh.exec('screen -ls | grep -c \'\\<working_bot\\>\'', {
		out: function (screenCount) {
			switch (screenCount) {
				case '0\n':
					ssh.exec(`screen -dmS working_bot`, {
						out: (stdout) => console.log(stdout),
						err: (stderr) => console.log(stderr),
						exit: () => resolve(console.log('New screen created') || 0)
					});
					break;
				case '1\n':
					resolve(console.log('Screen working_bot exists') || 0);
					break;
				default:
					throw Error('Too many screen called working_bot');
			}
		},
		err: (stderr) => {
			throw Error(stderr);
		}
	}).start()).then(() => ssh.end());
}

/**
 *
 * @returns {Promise<void>}
 */
function pm2Setup() {
	const ssh = sshConnect();
	return new Promise(resolve => ssh.exec(`pm2 list | grep -c '\\<working_bot\\>'`, {
		out: function (screenCount) {
			switch (screenCount) {
				case '0\n':
					ssh.exec(`cd ${vpsDir} && npm prune && npm i && pm2 start working_bot.json\n`, {
						out: (stdout) => console.log(stdout),
						err: (stderr) => {
							throw stderr;
						},
						exit: () => resolve(console.log('pm2 started') || 0)
					});
					break;
				case '1\n':
					ssh.exec(`cd ${vpsDir} && npm prune && npm i && pm2 restart working_bot\n`, { // `screen -S working_bot -p 0 -X stuff '^C\ncd ${vpsDir} && npm i && npm start\n'`
						out: (stdout) => console.log(stdout),
						err: (stderr) => {
							throw stderr;
						},
						exit: () => {
							resolve(console.log('working_bot is running') || 0);
						}
					});
					break;
				default:
					throw Error('Too many pm2 instances working_bot');
			}
		},
		err: (stderr) => {
			throw Error(stderr);
		}
	}).start()).then(() => ssh.end());
}

/**
 * Push a file to the remote
 * @param file_path
 * @param file
 * @param resolve
 */
function pushFile(file_path, file, resolve) {
	console.log('=>', file_path + file, '...');
	resolve(client.put(output_dir + file_path + file, vpsDir + file_path + file) && console.log('pushed'));
}

/**
 * Obfuscate a file and push it to the remote
 * @param {string} string
 * @param {string} file_path
 * @param {string} file
 * @param resolve
 */
function write_file(string, file_path, file, resolve) {
	if (output_dir === file_path) file_path = '';
	createDirRec(output_dir + file_path);
	console.log('save', output_dir + file_path);
	fs.writeFileSync(output_dir + file_path + file, string, 'utf-8');
	return pushFile(file_path, file, resolve);
}

/**
 * Obfuscate a file and push it to the remote
 * @param {string} string
 * @param {string} file_path
 * @param {string} file
 * @param resolve
 */
function obfuscate_js(string, file_path, file, resolve) {
	return write_file(JavaScriptObfuscate.obfuscate(string, options_obfuscate).getObfuscatedCode(), file_path, file, resolve);
}

/**
 * Obfuscate a file and push it to the remote
 * @param file_path
 * @param file
 * @param resolve
 */
function obfuscate_js_file(file_path, file, resolve) {
	
	return obfuscate_js(fs.readFileSync(file_path + file, 'utf-8'), file_path, file, resolve);
}


if (fs.existsSync(output_dir)) fs.rmSync(output_dir, {recursive: true});
createDirRec(output_dir);

(async () => {
	await client.connect({
		host: process.env.VPS_HOST,
		port: process.env.VPS_PORT,
		username: process.env.VPS_USER,
		password: process.env.VPS_PASSWORD
	});
	
	/**
	 * Removes old files
	 */
	if (await client._exists(vpsDir)) {
		for (const elements of await client.list(vpsDir)) {
			
			if (notExcluded(rmExclude, elements.name)) {
				console.log('del >', elements.name);
				if (elements.type === 'd') {
					await client.rmdir(vpsDir + elements.name, true);
				} else {
					await client.delete(vpsDir + elements.name);
				}
				continue;
			}
			
			if (elements.name !== 'handler') continue;
			
			const serverPath = vpsDir + elements.name + '/';
			for (const serverElements of await client.list(serverPath)) {
				console.log('del >', serverElements.name);
				if (serverElements.name === 'server') continue;
				if (serverElements.type === 'd') {
					await client.rmdir(serverPath + serverElements.name, true);
				} else {
					await client.delete(serverPath + serverElements.name);
				}
			}
		}
	} else {
		await client.mkdir(vpsDir, true);
	}
	
	const ignore = gitignoreList(__dirname).concat(['*.js', '*.html', '*.txt', '*.csv', '*.sql', '*backup*', '*bckp*', '*test*', '*log(s)?', 'language.json', '.git', '.idea', 'public_html', '_deactivated', 'looping', 'vps_setup.js']);
	const filesToUpload = getFilesOfDir(__dirname, ignore);
	
	const dirnameLen = __dirname.length;
	
	let lastPath = '';
	let promises = [];
	let listenersCount = 1;
	console.log(filesToUpload);
	/**
	 * Obfuscate and push the files
	 */
	for (const filePath of filesToUpload) {
		const separatorIndex = filePath.lastIndexOf('/');
		let path = filePath.substring(dirnameLen + 1, separatorIndex + 1),
			file = filePath.substring(separatorIndex + 1);
		
		if (lastPath !== path) {
			await client.exists(vpsDir + path)
				.then(async exists => {
					if (!exists) await client.mkdir(vpsDir + path, true);
				});
			lastPath = path;
		}
		
		if (file.endsWith('js')) {
			promises.push(new Promise(resolve => obfuscate_js_file(path, file, resolve)));
		} else {
			promises.push(new Promise(resolve => {
				createDirRec(output_dir + path);
				fs.copyFileSync(path + file, output_dir + path + file);
				pushFile(path, file, resolve);
			}));
		}
		
		listenersCount++;
		
		if (listenersCount === 10) {
			await Promise.all(promises);
			promises = [];
			listenersCount = 1;
		}
	}
	await Promise.all(promises);
	
	/**
	 * Obfuscate main bot
	 */
	await new Promise((resolve, reject) => webpack(config).run((err, res) => err ? reject(err) : write_file(JavaScriptObfuscate.obfuscate(fs.readFileSync(config.output.path + '/' + config.output.filename).toString(), options_obfuscate).getObfuscatedCode(), '', config.output.filename, resolve)));
	console.log('ok');
	await pm2Setup();
	
	await client.end();
})();

const options_obfuscate = {
	compact: true,
	controlFlowFlattening: true,
	controlFlowFlatteningThreshold: 0.5,
	deadCodeInjection: true,
	deadCodeInjectionThreshold: 0.3,
	debugProtection: false,
	debugProtectionInterval: 0,
	disableConsoleOutput: false,
	forceTransformStrings: [],
	identifiersPrefix: '',
	identifierNamesCache: {},
	identifierNamesGenerator: 'mangled-shuffled', // mangled-shuffled | hexadecimal
	log: false,
	numbersToExpressions: true,
	renameGlobals: true, // todo: renameGlobals
	selfDefending: true,
	simplify: true,
	splitStrings: true,
	splitStringsChunkLength: 3,
	stringArray: true,
	stringArrayCallsTransform: true,
	stringArrayCallsTransformThreshold: 0.75,
	stringArrayEncoding: ['rc4'], // base64
	stringArrayIndexesType: [ // hexadecimal-numeric-string | hexadecimal-number
		'hexadecimal-numeric-string'
	],
	stringArrayIndexShift: true,
	stringArrayRotate: true,
	stringArrayShuffle: true,
	stringArrayWrappersCount: 2,
	stringArrayWrappersChainedCalls: true,
	stringArrayWrappersParametersMaxCount: 3,
	stringArrayWrappersType: 'function',
	stringArrayThreshold: 0.75,
	transformObjectKeys: true,
	unicodeEscapeSequence: false,
	target: 'node'
};

const options_obfuscate_max = {
	compact: true,
	controlFlowFlattening: true,
	controlFlowFlatteningThreshold: 1,
	deadCodeInjection: true,
	deadCodeInjectionThreshold: 1,
	debugProtection: false,
	debugProtectionInterval: 0,
	disableConsoleOutput: true, //disableConsoleOutput: true,
	forceTransformStrings: [],
	identifierNamesCache: {},
	identifierNamesGenerator: 'hexadecimal',
	identifiersDictionary: [],
	identifiersPrefix: 'dQw4w9WgXcQ',
	ignoreImports: false,
	inputFileName: '',
	log: false,
	numbersToExpressions: true,
	optionsPreset: 'high-obfuscation',
	renameGlobals: false,
	renameProperties: false,
	renamePropertiesMode: 'safe',
	reservedNames: [],
	reservedStrings: [],
	seed: 0,
	selfDefending: true,
	simplify: true,
	sourceMap: false,
	sourceMapBaseUrl: '',
	sourceMapFileName: 'sourceMap.js',
	sourceMapMode: 'separate',
	sourceMapSourcesMode: 'sources-content',
	splitStrings: true,
	splitStringsChunkLength: 2,
	stringArray: true,
	stringArrayCallsTransform: true,
	stringArrayCallsTransformThreshold: 0.5,
	stringArrayEncoding: ['rc4'],
	stringArrayIndexesType: [
		'hexadecimal-number'
	],
	stringArrayIndexShift: true,
	stringArrayRotate: true,
	stringArrayShuffle: true,
	stringArrayWrappersCount: 1,
	stringArrayWrappersChainedCalls: true,
	stringArrayWrappersParametersMaxCount: 2,
	stringArrayWrappersType: 'function',
	stringArrayThreshold: 1,
	target: 'node',
	transformObjectKeys: false,
	unicodeEscapeSequence: false
};
