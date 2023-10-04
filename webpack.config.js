import path from "path";
import Webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import ForkTsCheckerNotifierWebpackPlugin from "fork-ts-checker-notifier-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

// const VERSION = require("./package.json").version;
import PACKAGE from "./package.json" assert {type: "json"};


/**
 * Webpack plugin which iterates through emitted .d.ts files and creates index files for them corresponding to the entry and output declarations.
 * What that means in essence is, that it adds proper type support for the bundled libs.
 */
class WebpackDeclarationsIndexer {
	// implements WebpackPluginInstance
	// Define `apply` as its prototype method which is supplied with compiler as its argument
	apply(compiler) {
		const pluginName = "WebpackDeclarationsIndexer";

		// webpack module instance can be accessed from the compiler object,
		// this ensures that correct version of the module is used
		// (do not require/import the webpack or any symbols from it directly).
		const { webpack } = compiler;

		// Compilation object gives us reference to some useful constants.
		const { Compilation } = webpack;

		// RawSource is one of the "sources" classes that should be used
		// to represent asset sources in compilation.
		const { RawSource } = webpack.sources;

		// Tapping to the "thisCompilation" hook in order to further tap to the compilation process on an earlier stage.
		compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
			// Map of new chunk based .d.ts files consisting of chunk name and a list of bundled .ts files in that chunk.
			// <string, string[]>
			const bundles = new Map();

			compilation.hooks.chunkAsset.tap(pluginName, (chunk, filename) => {
				// console.log(`WebpackDeclarationsIndexer() Chunk ${filename}`, chunk.name);
				const bundledFiles = [];

				// Explore each module within the chunk (built inputs):
				// Warning: .chunks and .getModules is deprecated in favor of the ChunkGraph and ModuleGraph APIs, which aren't documented and aren't intuitive for beginners.
				// For this reason we still use the deprecated APIs.
				// https://webpack.js.org/blog/2020-10-10-webpack-5-release/#module-and-chunk-graph
				chunk.getModules().forEach((module) => {

					// module.type === "javascript/auto" AKA NormalModule contains resourceResolveData
					if (module.resourceResolveData) {

						// console.log(`WebpackDeclarationsIndexer() chunk ${chunk.name}:`, module.resourceResolveData.relativePath);

						// tsf is the relative path to a .ts source file. It is assumed there exists a .d.ts file for this .ts file.
						// Since tsf lacks path information to the .d.ts file we need to look that up in the processAssets stage.
						// Output path involves tsconfig.json declarationDir and to a lesser degree output.path.
						const tsf = module.resourceResolveData.relativePath;
						if (tsf.endsWith(".ts")) {
							bundledFiles.push(tsf);
						}
					}
				});

				if (bundledFiles.length > 0) {
					bundles.set(chunk.name, bundledFiles)
				}
			})

			// Tapping to the assets processing pipeline on a specific stage.
			compilation.hooks.processAssets.tap(
				{
					name: pluginName,

					// Using one of the later asset processing stages to ensure
					// that all assets were already added to the compilation by other plugins.
					stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				(assets) => {
					// "assets" is an object that contains all assets
					// in the compilation, the keys of the object are pathnames of the assets
					// and the values are file sources.

					// Get a map of all .d.ts files which will be emitted.
					// <string, string>
					const declarationFileNames = new Map();
					for (const filename of Object.keys(assets)) {
						if (filename.endsWith('.d.ts')) {
							declarationFileNames.set(filename.substring(filename.lastIndexOf("/") + 1), filename);
						}
					}

					// console.log("WebpackDeclarationsIndexer() going to index declarations: ", [...declarationFileNames.keys()]);

					bundles.forEach((tsFiles, name) => {
						let aggregated = "";

						for (const tsf of tsFiles) {
							const dts = tsf.slice(tsf.lastIndexOf("/") + 1, -2) + "d.ts";
							const dfs = declarationFileNames.get(dts);
							if (dfs) {
								// Append a new export from the .d.ts file.
								aggregated += `export * from "./${dfs.slice(0, -5)}";\n`
							}
						}

						if (aggregated.length > 0) {
							compilation.emitAsset(`${name}.d.ts`, new RawSource(aggregated));
						}
					})
				}
			);
		});
	}
}


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
export default (env, argv) => {
	
	/**
	 * Separate function to get the plugins so we can dynamically change the list (add the Notifier plugin).
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
				__VERSION__: JSON.stringify(PACKAGE.version)
			}),
			new WebpackDeclarationsIndexer()
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
	
	// Returning the Webpack config.
	return {
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
						}, {
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
				}, {
					// Don't let Babel transpile since babel doesn't use the tsconfig.json and doesn't do type checking.
					test: /\.tsx?$/,
					use: [
						{
							loader: 'ts-loader',
							options: {  // Doc: https://github.com/TypeStrong/ts-loader
								// Disable type checker - we will use it in fork plugin as it slows down ts-loader extremely.
								transpileOnly: true
							}
						}, {
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
					],
					exclude: /node_modules/,
				}, {
					test: /\.html$/i,
					loader: "html-loader"
				}

			], // do not forget to change/install your own TS loader
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		plugins: getPlugins(env, argv),
		output: {
			filename: "[name].js",
			path: path.resolve(process.cwd(), 'dist'),
			clean: true,
			library: {
				type: 'umd' // window = Classical JS library which is attached to window. umd = all-in-one option
			}
		},
		externals: {
			// List here packages in a [name]: [name] notation which should not be bundled. See package.json "dependencies".
		},
		optimization: env.production ? {
			minimize: true,   // TerserPlugin only works with a limited set of devtool settings such as 'source-map'. 'eval' isn't supported.
			minimizer: [new TerserPlugin({
				extractComments: false  // Prevent creation of a rel.js.LICENSE.txt file.
			})],
		} : {}  // Defaults = based on mode.
	}
};