/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts,mdx}'],
	theme: {
		extend: {
			transitionProperty: {
				wh: 'width, height'
			},
			maxHeight: {
				'4/5': '80%'
			},
			colors: {
				main: '#48dfa5'
			},
			maxWidth: {
				default: '64rem'
			}
		}
	},
	plugins: []
};
