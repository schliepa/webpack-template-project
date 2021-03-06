/**
 * This ESLint config is used by the build script exclusively for TypeScript.
 * This file has to be located in the same folder as node_modules as it will otherwise fail to resolve plugins.
 * Option resolvePluginsRelativeTo doesn't seem to work.
 */
module.exports = {
	"root": true,   // Avoid looking into the home directory for a .eslintrc file.
	"env": {
		"browser": true,
		"es2020": true,
	},
	"ignorePatterns": ["*.js"],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended"
	],
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 11,  // = es2020
		"sourceType": "module"
		//"project": "../client/tsconfig.json"  // <- While this is technically correct, it immensely increases linting time.
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		// Rules are specified here: https://eslint.org/docs/rules/
		// We use errors because we want to enforce the code style.
		"indent": "off",	// Doesn't quite work for TS.
		// Buggy but better than the alternative. Ok for clean code.
		// Can't fix too mangled indentation. In that case fully reset indentation via the following command:
		// linux: find . -name '*.ts' -print0 | xargs -0 sed -i 's/^[ \t]*//g'
		// unix: find src -name '*.ts' ! -type d -exec bash -c 'expand -t 4 "$0" > /tmp/e && mv /tmp/e "$0"' {} \;
		"@typescript-eslint/indent": ["error", "tab"],  // Tabs instead of spaces.
		//"multiline-comment-style": ["error"],   // Indent block comments correctly. Disabled as it is a massive PITA.
		
		"linebreak-style": "off",   //["error", "unix"], -> Depends on the git config.
		"quotes": ["error",	"double"],  // Double quotes are preferred - what about es6 quotes?
		"semi": ["error", "always"],	// Semicolon is enforced.
		"brace-style": ["error", "1tbs"],
		"comma-dangle": ["error", "never"], // Don't keep dangling commas.
		"curly": ["error", "all"],  // Curly braces must always be used.
		"spaced-comment": ["error", "always", {
			"line": {
				"markers": ["/"],
				"exceptions": ["-", "+"]
			},
			"block": {
				"markers": ["!"],
				"exceptions": ["*"],
				"balanced": true
			}
		}],
		"no-mixed-operators": ["error"],
		"operator-linebreak": [
			"error",
			"after", // Enforce operators to be placed before line breaks.
			{
				"overrides": {
					"=": "none",	// Don't allow line breaks after '='.
				}
			}
		],
		//"keyword-spacing": ["error", {"before": true}], // Don't enforce after? Doesn't work.
		"space-in-parens": ["error", "never"],
		"comma-spacing": ["error"],
		"semi-spacing": ["error"],
		"arrow-spacing": ["error"],
		"func-call-spacing": ["error", "never"],	// Don't add a space between function and bracket (fn ()).
		"space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
		"object-curly-spacing": ["error"],
		"@typescript-eslint/type-annotation-spacing": ["error"],   // TypeScript type annotation spacing.
		"no-var": ["error"],
		"@typescript-eslint/no-namespace": ["error"],   // Don't allow the use of TypeScript namespaces and modules as the ES2015 module syntax is preferred.

		"no-unused-vars": "off",	//["warn"]
	}
};