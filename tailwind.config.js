module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./pages/**/*.tsx", "./lib/**/*.tsx", "./components/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        orange: "#f35917",
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/custom-forms")],
};
