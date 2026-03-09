/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: "rgb(49,47,239)",
                    hover: "rgb(60,58,255)",
                },
                dark: {
                    bg: "#0f111a",
                    card: "#161b2a",
                    border: "#1f2937",
                }
            },
        },
    },
    plugins: [],
}
