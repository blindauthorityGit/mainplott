// /** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./sections/**/*.{js,ts,jsx,tsx}", // Add sections folder if you’re using one
        "./layout/**/*.{js,ts,jsx,tsx}", // Add sections folder if you’re using one
    ],
    theme: {
        extend: {
            fontFamily: {
                ...fontFamily,
                headline: ["Abolition", "sans-serif"],
                body: ["Montserrat", "sans-serif"],
            },
            colors: {
                primaryColor: {
                    DEFAULT: "#bb969d",
                    50: "#faf6f7",
                    100: "#f5eeef",
                    200: "#ebe0e1",
                    300: "#dbc6ca",
                    400: "#bb969d",
                    500: "#ae858e",
                    600: "#956975",
                    700: "#7b5560",
                    800: "#684952",
                    900: "#5b4049",
                    950: "#312026",
                },

                accentColor: {
                    DEFAULT: "#F3EEC3",
                },
                textColor: {
                    DEFAULT: "#393836",
                },
                successColor: {
                    DEFAULT: "#297373",
                },
                errorColor: {
                    DEFAULT: "#9E2A2B",
                },
                warningColor: {
                    DEFAULT: "#F18F01",
                },
                blackColor: {
                    DEFAULT: "#090C08",
                },
                background: "#F9F9F9",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
};
