const webpack_node_externals = require('webpack-node-externals');


module.exports = {
	entry: './working_bot.js',
	target: 'node', // use require() & use NodeJs CommonJS style
	mode: 'production',
	externals: [webpack_node_externals()],
	externalsPresets: {
		node: true // in order to ignore built-in modules like path, fs, etc.
	},
	module: {
		rules: [
			{
				exclude: /node_modules/
			}
		]
	},
	
	experiments: {
		topLevelAwait: true
	},
	
	optimization: {
		minimize: true
	},
	output: {
		filename: 'working_bot.js',
		path: __dirname + 'vps_setup/working_bot'
	}
};