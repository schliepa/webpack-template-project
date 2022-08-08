/**
 * This is simply a hack that allows us to import HTML files in TypeScript.
 * These imports will then we turned into HTML strings by Webpacks html-loader.
 */
declare module "*.html" {
	const value: string;
	export default value;
}