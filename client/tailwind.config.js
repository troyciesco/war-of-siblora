const defaultTheme = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: colors.teal,
				secondary: colors.blue,
				tertiary: colors.emerald
			},
			fontFamily: {
				display: ["MedievalSharp", ...defaultTheme.fontFamily.sans],
				sans: ["Barlow", ...defaultTheme.fontFamily.sans],
				mono: ["Silkscreen", ...defaultTheme.fontFamily.mono]
			}
		}
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography"), require("@tailwindcss/aspect-ratio")]
}
