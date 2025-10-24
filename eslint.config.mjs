import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from "@stylistic/eslint-plugin";

/*
 * This ESLint config is used by the build script exclusively for TypeScript.
 * This file has to be located in the same folder as node_modules as it will otherwise fail to resolve plugins.
 * Option resolvePluginsRelativeTo doesn't seem to work.
 */
export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		name: "ESLint Style",
		languageOptions: {
			parserOptions: {
				projectService: true,
				// tsconfigRootDir: path.resolve(process.cwd(), '../client'), // Could use import.meta.dirname as a relative base instead in the future.
				ecmaVersion: 11,
			},
			globals: {
				"Atomics": "readonly",
				"SharedArrayBuffer": "readonly"
			},
		},
		ignores: ["**/*.js"],
		files: ["**/*.ts"],
		plugins: {
			// "@typescript-eslint": tseslint, // Already in use
			"@stylistic": stylistic
		},
		rules: {
			// region -------- Style Rules --------
			// re gion -------- Prettier conflicts --------
			// Rules that would conflict with Prettier. -> We don't use Prettier, we use ESLint Stylistic
			// These rules can be found out by running npx eslint-config-prettier ./buildscript/tool.js
			// Make sure the to check file is called eslint.mjs as the script can't handle non-default ESLint config names.
			// We don't like prettier. Its line wrapping is ridiculous. something like Log.d("Test", "foo"); will turn into a four-liner.
			// Also, Prettiers conflict with no-mixed-operators would lead to more bugs.

			// Buggy but better than the alternative. Ok for clean code.
			// Can't fix too mangled indentation. In that case fully reset indentation via the following command:
			// linux: find . -name '*.ts' -print0 | xargs -0 sed -i 's/^[ \t]*//g'
			// unix: find src -name '*.ts' ! -type d -exec bash -c 'expand -t 4 "$0" > /tmp/e && mv /tmp/e "$0"' {} \;
			"@stylistic/indent": ["error", "tab"],  // Tabs instead of spaces.
			"@stylistic/keyword-spacing": ["error", {"before": true}], // Don't enforce after? Doesn't work.
			"@stylistic/no-extra-semi": "error",
			"@stylistic/type-annotation-spacing": ["error"],   // TypeScript type annotation spacing.
			"arrow-spacing": ["error"],
			"brace-style": ["error", "1tbs"],
			"comma-dangle": ["error", "never"], // Don't keep dangling commas.
			"comma-spacing": ["error"],
			"func-call-spacing": ["error", "never"],	// Don't add a space between function and bracket (fn ()).
			"no-multi-spaces": ["error", { "ignoreEOLComments": true }],
			"no-trailing-spaces": ["error"],
			"object-curly-spacing": ["error", "never"],
			"operator-linebreak": [
				"error",
				"after", // Enforce operators to be placed before line breaks.
				{
					"overrides": {
						"=": "none",	// Don't allow line breaks after '='.
					}
				}
			],
			"semi": ["error", "always"],	// Semicolon is enforced.
			"semi-spacing": ["error"],
			"space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
			"space-in-parens": ["error", "never"],
			"space-infix-ops": ["error"],

			"quotes": ["error",	"double"],  // Double quotes are preferred - what about es6 quotes?
			"no-mixed-operators": ["error"],	// Prettier conflicts with this, removing some "unnecessary" parentheses again (e.g. a + (b * c)).

			// endre gion -------- Prettier conflicts --------


			// Rules are specified here: https://eslint.org/docs/rules/
			// and here: https://typescript-eslint.io/rules/
			// We use errors because we want to enforce the code style.

			//"multiline-comment-style": ["error"],   // Indent block comments correctly. Disabled as it is a massive PITA.

			"linebreak-style": "off",   //["error", "unix"], -> Depends on the git config.
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
			"@stylistic/padding-line-between-statements": [
				"error",
				{ "blankLine": "always", "prev": "*", "next": ["class", "function", "interface", "type", "enum", "try", "block"] },   // Blank lines before class, function and try.
				{ "blankLine": "always", "prev": ["class", "function", "interface", "type", "enum", "try", "block"], "next": "*" },   // Blank lines after class, function and try.
				{ "blankLine": "always", "prev": "*", "next": ["if", "switch", "for", "while", "return"] },   // Blank lines before block statements unless they are nested.
				{ "blankLine": "always", "prev": ["if", "switch", "for", "while"], "next": "*"  },   // Blank lines after block statements unless they are nested.
				{ "blankLine": "any", "prev": ["if", "switch", "for", "while"], "next": ["if", "switch", "for", "while", "break"] }, // Exceptions to the previous rule.
				{ "blankLine": "always", "prev": "*", "next": ["export"] },  // Blank line before an export statement.
				// "class" rule isn't applied to "export class". Need to use "export" rule for that. As a result even multiple export statements in a row will now enforce a space.
			],
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
				selector: "variable",
				modifiers: ["const", "global"],
				format: ["camelCase", "UPPER_CASE", "PascalCase"],	// Added PascalCase to export / top level const variables.
				leadingUnderscore: "allow"
			}, {
				selector: "objectLiteralProperty",
				format: ["PascalCase", "camelCase", "UPPER_CASE"], // Be more forgiving for objects literals. Hope this isn't biting us.
				leadingUnderscore: "allow"
			}, {
				selector: "import",
				format: ["camelCase", "PascalCase", "UPPER_CASE"],
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

			// endregion -------- Style Rules --------

			// region -------- Type Rules --------

			// Type checking
			// As seen in plugin:@typescript-eslint/recommended
			// Since we import the recommended rules, we only need to list them here if we deviate from them.
			// Disabling ESLint rules for them isn't required, as the recommendedTypeChecked import should take care of that.
			"@typescript-eslint/adjacent-overload-signatures": "error",
			"@typescript-eslint/ban-ts-comment": "error",
			"@typescript-eslint/no-empty-object-type": "error",
			"@typescript-eslint/no-unsafe-function-type": "error",
			"@typescript-eslint/no-wrapper-object-types": "error",
			"no-array-constructor": "off",
			"@typescript-eslint/no-array-constructor": "error", // Isn't this redundant with array-type being set?
			"no-empty-function": "off",
			"@typescript-eslint/no-empty-function": "warn",	// >416 found errors. A bit much.
			"@typescript-eslint/no-empty-interface": "error",
			"@typescript-eslint/no-extra-non-null-assertion": "error",
			"no-loss-of-precision": "off",
			"@typescript-eslint/no-loss-of-precision": "error",
			"@typescript-eslint/no-misused-new": "error",
			"@typescript-eslint/no-namespace": "error",
			"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
			//"@typescript-eslint/no-non-null-assertion": "warn",	// We might actually allow this one due to JS to TS conversion reasons.
			"@typescript-eslint/no-this-alias": "error",
			"@typescript-eslint/no-unnecessary-type-constraint": "error",
			"@typescript-eslint/no-var-requires": "error",
			"@typescript-eslint/prefer-as-const": "error",
			"@typescript-eslint/prefer-namespace-keyword": "error",
			"@typescript-eslint/triple-slash-reference": "error",
			"@typescript-eslint/no-unused-expressions": ["warn", {allowShortCircuit: true, allowTernary: true}],	// This rule has a tendency for false positives.
			"@typescript-eslint/prefer-promise-reject-errors": ["error", {allowEmptyReject: true}],

			// Inverted plugin:@typescript-eslint/recommended - stuff we allow.
			"@typescript-eslint/no-explicit-any": "off",	// Needed for JS to TS interop.
			"@typescript-eslint/no-inferrable-types": "off",	// Irrelevant?
			"@typescript-eslint/no-non-null-assertion": "off",	// We allow this one due to JS to TS interop reasons.
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["warn", {args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_"}],	// Might want to configure { "args": "none" } as it could be useful for callbacks.

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
			// allowInGenericTypeArguments isn't always working: https://github.com/typescript-eslint/typescript-eslint/issues/8113
			"@typescript-eslint/no-invalid-void-type": ["warn", {allowAsThisParameter: true}], // unbound-method uses "this: void" in parameters as a safeguard. Downgraded to warn/off, as allowInGenericTypeArguments isn't working properly.
			"@typescript-eslint/no-meaningless-void-operator": "error",
			"@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
			"no-throw-literal": "off",
			"@typescript-eslint/only-throw-error": "error", // Corresponds to no-throw-literal
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
			"@typescript-eslint/no-unsafe-argument": "error",

			// Other type validation
			"@typescript-eslint/method-signature-style": "error",
			"@typescript-eslint/explicit-function-return-type": ["error", {allowExpressions: true}],
			"@typescript-eslint/no-require-imports": "error",
			"@typescript-eslint/typedef": ["error", {parameter: true, arrowParameter: true}], // Sort of a no-implicit-any rule.
			"@typescript-eslint/no-redundant-type-constituents": "warn", // Downgraded to warn, since it is useful in combinations with promises (e.g. Promise<any> | any).

			// Other rules
			"array-callback-return": "error",

			// Message to guard type only files. Needs to be enabled per-file, which can be done by adding this line to the top of the relevant files:
			// /* eslint "no-restricted-imports": ["error", {patterns: [{group:[ "*\/*"], message: "Imports are to be avoided in type-only files to prevent circular dependencies."}]}] */
			"no-restricted-imports": ["off", {patterns: [{group:[ "*/*"], message: "Imports are to be avoided in type-only files to prevent circular dependencies."}]}],

		}
	},
);
