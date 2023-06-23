// This ESLint config is optimized for TypeScript and enforcing of code style.
// This file has to be located in the same folder as node_modules as it will otherwise fail to resolve plugins.
// Option resolvePluginsRelativeTo doesn't seem to work.
module.exports = {
	"root": true,   // Avoid looking into the home directory for a .eslintrc file.
	"env": {
		"browser": true,
		"es2020": true,
	},
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
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		// Rules are specified here: https://eslint.org/docs/rules/
		// We use errors because we want to enforce the code style.
		"indent": "off",    // Doesn't quite work for TS.
		// Buggy but better than the alternative. Ok for clean code.
		// Can't fix too mangled indentation. In that case fully reset indentation via the following command:
		// linux: find . -name '*.ts' -print0 | xargs -0 sed -i 's/^[ \t]*//g'
		// unix: find src -name '*.ts' ! -type d -exec bash -c 'expand -t 4 "$0" > /tmp/e && mv /tmp/e "$0"' {} \;
		"@typescript-eslint/indent": ["error", "tab"],  // Tabs instead of spaces.
		// "multiline-comment-style": ["error"],   // Indent block comments correctly. -> breaks single line comments.

		"linebreak-style": "off",   //["error", "unix"], -> Depends on the git config.
		"quotes": ["error",	"double"],  // Double quotes are preferred - what about es6 quotes?
		"semi": ["error", "always"],    // Semicolon is enforced.
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
					"=": "none",    // Don't allow line breaks after '='.
				}
			}
		],
		"padding-line-between-statements": "off",   // Must be disabled to not cause problems with the following TS version of it.
		"@typescript-eslint/padding-line-between-statements": [
			"error",
			{ "blankLine": "always", "prev": "*", "next": ["class", "function", "interface", "type", "try", "block"] },   // Blank lines before class, function and try.
			{ "blankLine": "always", "prev": ["class", "function", "interface", "type", "try", "block"], "next": "*" },   // Blank lines after class, function and try.
			{ "blankLine": "always", "prev": "*", "next": ["if", "switch", "for", "while", "return"] },   // Blank lines before block statements unless they are nested.
			{ "blankLine": "always", "prev": ["if", "switch", "for", "while"], "next": "*"  },   // Blank lines after block statements unless they are nested.
			{ "blankLine": "any", "prev": ["if", "switch", "for", "while"], "next": ["if", "switch", "for", "while", "break"] }, // Exceptions to the previous rule.
			{ "blankLine": "always", "prev": "*", "next": ["export"] },  // Blank line before an export statement.
			// "class" rule isn't applied to "export class". Need to use "export" rule for that. As a result even multiple export statements in a row will now enforce a space.
		],
		"keyword-spacing": "off", // Must be disabled to not cause problems with the following TS version of it.
		"@typescript-eslint/keyword-spacing": ["error", {"before": true}], // Don't enforce after? Doesn't work.
		"space-in-parens": ["error", "never"],
		"comma-spacing": ["error"],
		"space-infix-ops": ["error"],
		"semi-spacing": ["error"],
		"arrow-spacing": ["error"],
		"func-call-spacing": ["error", "never"],    // Don't add a space between function and bracket (fn ()).
		"space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
		"no-trailing-spaces": ["error"],
		"no-multi-spaces": ["error", { "ignoreEOLComments": true }],
		"object-curly-spacing": ["error"],
		"@typescript-eslint/type-annotation-spacing": ["error"],   // TypeScript type annotation spacing.
		"no-var": ["error"],
		"@typescript-eslint/no-namespace": ["error"],   // Don't allow the use of TypeScript namespaces and modules as the ES2015 module syntax is preferred.

        "no-unused-vars": "off",    //["warn"]
    }
};