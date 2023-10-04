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
		"sourceType": "module",
		"project": "./tsconfig.json"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		// ------ Style Rules ------

		// Rules are specified here: https://eslint.org/docs/rules/
		// and here: https://typescript-eslint.io/rules/
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
		"func-call-spacing": ["error", "never"],	// Don't add a space between function and bracket (fn ()).
		"space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
		"no-trailing-spaces": ["error"],
		"no-multi-spaces": ["error", { "ignoreEOLComments": true }],
		"object-curly-spacing": ["error", "never"],
		"@typescript-eslint/type-annotation-spacing": ["error"],   // TypeScript type annotation spacing.
		"no-var": ["error"],
		"@typescript-eslint/naming-convention": ["error", {
			selector: "default",
			format: ["camelCase"],
			leadingUnderscore: "allow",
			trailingUnderscore: "allow",
		}, {
			selector: "variable",
			format: ["camelCase"],  // Removed UPPER_CASE from the default variable config.
			leadingUnderscore: "allow"
		}, {
			selector: "variable",
			modifiers: ["const"],
			format: ["camelCase", "UPPER_CASE"],	// Added UPPER_CASE to const variables.
			leadingUnderscore: "allow"
		}, {
			selector: "objectLiteralProperty",
			format: ["PascalCase", "camelCase", "UPPER_CASE"], // Be more forgiving for objects literals. Hope this isn't biting us.
			leadingUnderscore: "allow"
		}, {
			selector: "classProperty",
			modifiers: ["readonly"],
			format: ["camelCase", "UPPER_CASE"],	// Added UPPER_CASE to readonly variables.
			leadingUnderscore: "allow"
		}, {
			selector: "enumMember",
			format: ["camelCase", "UPPER_CASE"]	// Added UPPER_CASE to enum members.
		}, {
			selector: "typeLike",
			format: ["PascalCase"],
		}, {
			"selector": [
				"classProperty",
				"objectLiteralProperty",
				"typeProperty",
				"classMethod",
				"objectLiteralMethod",
				"typeMethod",
				"accessor",
				"enumMember"
			],
			"format": null,
			"modifiers": ["requiresQuotes"] // If it's a property which requires quotes due to special characters we ignore the formatting. Common usage: HTTP headers.
		}],	// TODO Rule for parameter in the .then handler of a import call which allows PascalCase.

		// Note: Requires tsconfig project reference for 23 of the standard recommended lint rules.
		// Disabled all type checking in this file.

		"no-unused-vars": "off",
		// "@typescript-eslint/no-unused-vars": "off",

		// ------ General Type Rules ------

		// Type checking
		// As seen in plugin:@typescript-eslint/recommended
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/ban-ts-comment": "error",
		"@typescript-eslint/ban-types": "error",
		"no-array-constructor": "off",
		"@typescript-eslint/no-array-constructor": "error", // Isn't this redundant with array-type being set?
		"no-empty-function": "off",
		"@typescript-eslint/no-empty-function": "error",
		"@typescript-eslint/no-empty-interface": "error",
		"@typescript-eslint/no-extra-non-null-assertion": "error",
		"no-extra-semi": "off",
		"@typescript-eslint/no-extra-semi": "error",
		"no-loss-of-precision": "off",
		"@typescript-eslint/no-loss-of-precision": "error",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-namespace": "error",
		"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
		//"@typescript-eslint/no-non-null-assertion": "warn",	// We might actually allow this one due to JS to TS interop reasons.
		"@typescript-eslint/no-this-alias": "error",
		"@typescript-eslint/no-unnecessary-type-constraint": "error",
		"@typescript-eslint/no-var-requires": "error",
		"@typescript-eslint/prefer-as-const": "error",
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/triple-slash-reference": "error",

		// Inverted plugin:@typescript-eslint/recommended - stuff we allow.
		"@typescript-eslint/no-explicit-any": "off",	// Needed for JS to TS interop.
		"@typescript-eslint/no-inferrable-types": "off",	// Irrelevant?
		"@typescript-eslint/no-non-null-assertion": "off",	// We allow this one due to JS to TS interop reasons.
		"@typescript-eslint/no-unused-vars": "warn",

		// As seen in plugin:@typescript-eslint/strict
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/ban-tslint-comment": "error",
		"@typescript-eslint/class-literal-property-style": "error",
		"@typescript-eslint/consistent-generic-constructors": "error",
		"@typescript-eslint/consistent-type-assertions": "error",
		"@typescript-eslint/consistent-type-definitions": "error",
		"@typescript-eslint/no-mixed-enums": "error",
		"dot-notation": "off",
		"@typescript-eslint/dot-notation": "error",
		"@typescript-eslint/no-base-to-string": "error",
		"@typescript-eslint/no-confusing-non-null-assertion": "error",
		"@typescript-eslint/no-duplicate-enum-values": "error",
		"@typescript-eslint/no-invalid-void-type": ["error", {allowAsThisParameter: true}], // unbound-method uses "this: void" in parameters as a safeguard.
		"@typescript-eslint/no-meaningless-void-operator": "error",
		"@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
		"no-throw-literal": "off",
		"@typescript-eslint/no-throw-literal": "error",
		"@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
		"@typescript-eslint/no-unnecessary-type-arguments": "error",
		"@typescript-eslint/no-unsafe-declaration-merging": "error",
		"@typescript-eslint/no-unsafe-enum-comparison": "error",
		"no-useless-constructor": "off",
		"@typescript-eslint/no-useless-constructor": "error",
		"@typescript-eslint/prefer-for-of": "warn",
		"@typescript-eslint/prefer-function-type": "error", // Doesn't this contradict consistent-type-definitions?
		"@typescript-eslint/prefer-literal-enum-member": "error",
		"@typescript-eslint/prefer-optional-chain": "warn",
		"@typescript-eslint/prefer-reduce-type-parameter": "error",
		"@typescript-eslint/prefer-return-this-type": "error",
		"@typescript-eslint/prefer-string-starts-ends-with": "error",
		"@typescript-eslint/prefer-ts-expect-error": "error",
		"@typescript-eslint/unified-signatures": "error",

		// Inverted plugin:@typescript-eslint/strict - stuff we allow.
		"@typescript-eslint/consistent-indexed-object-style": "error",   // Would convert "interface Foo {[key: string]: unknown;}" to "Record<string, unknown>;"
		"@typescript-eslint/no-extraneous-class": "off",   // But classes are so much more readable than individual functions. Declaring this rule as stupid.
		"@typescript-eslint/no-unnecessary-condition": "off",   // Required when mixing JS and TS code.
		"@typescript-eslint/no-dynamic-delete": "off",  // Used and useful.
		"@typescript-eslint/prefer-includes": "warn",  // Too pedantic. Useful but not required.
		"@typescript-eslint/prefer-nullish-coalescing": "off",  // Useful but not required.
		"@typescript-eslint/non-nullable-type-assertion-style": "off", // Broken rule. Force-fixes specific type assertions to non-null assertions. el: Element | null => "el as HTMLElement" would turn into "el!".

		// As seen in plugin:@typescript-eslint/recommended-requiring-type-checking
		"@typescript-eslint/await-thenable": "error",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-misused-promises": "error",
		"@typescript-eslint/no-for-in-array": "error",
		"@typescript-eslint/no-unnecessary-type-assertion": "error",
		// "@typescript-eslint/restrict-template-expressions": ["error", {allowNumber: true, allowBoolean: true, allowAny: true}],
		"@typescript-eslint/unbound-method": ["error", {ignoreStatic: true}],
		"no-implied-eval": "off",
		"@typescript-eslint/no-implied-eval": "error",
		"require-await": "off",
		"@typescript-eslint/require-await": "error",
		"@typescript-eslint/no-unsafe-return": "error",

		// Inverted plugin:@typescript-eslint/recommended-requiring-type-checking - stuff we allow.
		"@typescript-eslint/restrict-template-expressions": "off",
		"@typescript-eslint/no-unsafe-call": "off",   // Widely used in MiCollab due to JS to TS conversion.
		"@typescript-eslint/no-unsafe-member-access": "off",   // Widely used in MiCollab due to JS to TS conversion.
		"@typescript-eslint/restrict-plus-operands": "error",
		"@typescript-eslint/no-unsafe-assignment": "warn",	// Flawed as it gets raised when assigning any to any.
		"@typescript-eslint/no-unsafe-argument": "warn",

		// Other type validation
		"@typescript-eslint/method-signature-style": "error",
		"@typescript-eslint/explicit-function-return-type": ["error", {allowExpressions: true}],
		"@typescript-eslint/no-require-imports": "error",
		"@typescript-eslint/typedef": ["error", {parameter: true, arrowParameter: true}], // Sort of a no-implicit-any rule.

		// Message to guard type only files. Needs to be enabled per-file, which can be done by adding this line to the top of the relevant files:
		// /* eslint "no-restricted-imports": ["error", {patterns: [{group:[ "*\/*"], message: "Imports are to be avoided in type-only files to prevent circular dependencies."}]}] */
		"no-restricted-imports": ["off", {patterns: [{group:[ "*/*"], message: "Imports are to be avoided in type-only files to prevent circular dependencies."}]}],

		// ------ Strict Type Rules ------

		// See .eslintrc.strict.cjs for strict rules.
	}
};

