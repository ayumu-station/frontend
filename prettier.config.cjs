// Multi-Root vscode Svelte
// https://github.com/sveltejs/prettier-plugin-svelte/issues/311#issuecomment-1320254867
module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: [require('prettier-plugin-svelte')],
	pluginSearchDirs: ['.'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};
