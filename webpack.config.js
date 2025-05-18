const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	target: 'node',
	externals: [nodeExternals()],
	resolve: {
		extensions: ['.ts', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
};
