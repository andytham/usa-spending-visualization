const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
	entry: [
		'./main.js'
	],
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'main.js'
	},
	module: {
		rules: [
			{
				test: /\.js[x]?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
        test: /\.(s*)css$/,
				use: [MiniCssExtractPlugin.loader, 'sass-loader']
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "style.css"
		})
	]
};

module.exports = config;