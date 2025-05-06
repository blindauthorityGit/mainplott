/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./sections/**/*.{js,ts,jsx,tsx}",
        "./layout/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        // Customize the container plugin:
        screens: {
            ...defaultTheme.screens,
            "2xl": "1600px",
        },
        container: {
            center: true, // Centers the container by default.
            padding: "1rem", // Optional: Adds some padding on smaller screens.
            screens: {
                // You can set custom container widths for each breakpoint.
                sm: "100%", // For small screens, the container spans the full width.
                md: "100%",
                lg: "1024px", // Example for large screens.
                xl: "1280px", // Example for extra-large screens.
                // "2xl": "1400px", // Custom max-width for ultra-wide screens.
            },
        },
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
                accentColor: { DEFAULT: "#F3EEC3" },
                textColor: { DEFAULT: "#393836" },
                successColor: { DEFAULT: "#297373" },
                errorColor: { DEFAULT: "#9E2A2B" },
                infoColor: { DEFAULT: "#B0D0D3" },
                warningColor: { DEFAULT: "#F18F01" },
                blackColor: { DEFAULT: "#090C08" },
                background: "#F9F9F9",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [
        // this runs after Tailwind’s container rules and re-caps at 1400px
        // this runs after Tailwind’s container rules and re-caps at 1400px
        function ({ addComponents }) {
            addComponents({
                "@media (min-width: 1600px)": {
                    ".container": { maxWidth: "1400px" },
                },
            });
        },
    ],
};
