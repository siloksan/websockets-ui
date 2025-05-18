module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	plugins: ['@typescript-eslint', '@typescript-eslint/eslint-plugin', 'prettier'],
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
		{
			files: ['jest.config.js'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'import/extensions': 'off',
		'import/prefer-default-export': 'off',
		'no-console': 'off',
	},
};
