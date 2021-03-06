const path = require("path");
const Webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const VERSION = require("./package.json").version;

/**
 * Shared generic build config.
 *
 * Notes one multiple build targets / platforms:
 * - Adding ifdef-loader is recommended for target specific code inclusion.
 * - Naming the cache individually is important as otherwise there will be issues.
 *
 * env.production // only if `--env production` was passed
 * argv.mode === 'production' // only if `--mode production` was passed
 *
 * @param {{production?: boolean, platform?: string}} env See https://webpack.js.org/api/cli/#environment-options for the how-to
 * @param argv Those are actually the cmd arguments (things like --watch or --mode).
 */
module.exports = (env, argv) => ({
	mode: env.production ? "production" : "development",
	devtool: env.production ? false : "inline-source-map",
	cache: env.production ? false : {
		// Notes on performance:
		// - Cache type 'filesystem' has shown to be much more performant than 'memory'.
		// - If ESLint is in the build pipeline the Webpack build will be much slower for unknown reasons. Caching also doesn't appear to work in that case.
		// - If there are no changes the performance seems to always be around 1 second, even with ESLint in the pipeline.
		// Cache name is used to ensure different platform targets don't collide. Otherwise there might be issues. Especially with ifdef-loader.
		name: `${env.platform || ""}Cache`,
		type: 'filesystem'
	},
	bail: env.production,
	target: 'web',
	entry: {
		main: "./src/index.ts"
	},
	module: {
		// Note: Loaders are executed right-to-left aka bottom-to-top. Files run through all loaders in order.
		rules: [
			{
				// Only transpile js since ts-loader already transpiles the ts files.
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'], // Requires devDependencies in package.json.
							// Using core-js and regenerator-runtime for polyfilling causes some weird issues.
							// presets: [['@babel/preset-env', {useBuiltIns: "usage", corejs: 3}]], // Requires devDependencies in package.json.
							// Adding '@babel/preset-typescript' would make babel able to convert ts to js but without type checking (which we want).
							cacheDirectory: true
						}
					},
					{
						loader: 'ifdef-loader',
						options: {
							PLATFORM: env.platform,
							DEBUG: !env.production,
							"ifdef-verbose": false,                // add this for verbose output
							"ifdef-triple-slash": false,           // add this to use double slash comment instead of default triple slash
							"ifdef-fill-with-blanks": true,        // add this to remove code with blank spaces instead of "//" comments
							"ifdef-uncomment-prefix": "// #code "  // add this to uncomment code starting with "// #code "
						}
					}
				]
			},
			{
				// Don't let Babel transpile since babel doesn't use the tsconfig.json and doesn't do type checking.
				test: /\.tsx?$/,
				use: [{
					loader: 'ts-loader',
					options: {  // Doc: https://github.com/TypeStrong/ts-loader
						// Disable type checker - we will use it in fork plugin as it slows down ts-loader extremely.
						transpileOnly: true
					}
				}],
				exclude: /node_modules/,
			}

		], // do not forget to change/install your own TS loader
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	plugins: getPlugins(env, argv),
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
		library: {
			type: 'umd' // window = Classical JS library which is attached to window. umd = all-in-one option
		}
	},
	optimization: env.production ? {
		minimize: true,   // TerserPlugin only works with a limited set of devtool settings such as 'source-map'. 'eval' isn't supported.
		minimizer: [new TerserPlugin({
			extractComments: false  // Prevent creation of a rel.js.LICENSE.txt file.
		})],
	} : {}  // Defaults = based on mode.
});


/**
 * Extracted function to get the plugins. Extracted so we can dynamically change the list (add the Notifier plugin).
 * @param env
 * @param argv
 * @returns {Plugin[]}
 */
function getPlugins(env, argv) {
	const plugins = [
		// Plugin to clean ./dist.
		new CleanWebpackPlugin(),
		// Plugin for HTML templating.
		new HtmlWebpackPlugin({title: "Foo Bar"}),
		// Plugin to copy raw files to ./dist.
		new CopyWebpackPlugin({
			patterns: [
				{from: "./src/manifest.json"},
				{from: "./assets/appicon.png"},
				{from: "./html/"},
			],
		}),
		// Lint the code.
		new ESLintPlugin({fix: true, threads: true}),
		new ForkTsCheckerWebpackPlugin({
			typescript: {
				memoryLimit: 4096
			}
		}),
		// Replace all occurrences of __VERSION__ in the source code with the version from package.json.
		// Since this is a direct replacement strings must include '"'.
		// This can be achieved either by the use of JSON.stringify() here or by using it like this: "__VERSION__" in the code.
		new Webpack.DefinePlugin({
			__VERSION__: JSON.stringify(VERSION)
		})
	];

	// Only add the Notifier plugin in watcher mode.
	if (argv.watch) {
		plugins.push(
			// Show a notification if type checking failed.
			new ForkTsCheckerNotifierWebpackPlugin({
				skipFirstNotification: false,
				skipSuccessful: true,
				excludeWarnings: false
			}));
	}

	return plugins;
}