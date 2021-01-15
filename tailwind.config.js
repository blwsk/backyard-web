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
  variants: {
    backgroundColor: ["hover", "responsive", " focus", "dark", "dark-hover"],
    textColor: ["hover", "responsive", "focus", "dark", "dark-hover"],
    borderColor: ["hover", "responsive", "focus", "dark", "dark-hover"],
  },
  plugins: [
    require("@tailwindcss/custom-forms"),
    require("tailwindcss-dark-mode")(),
  ],
};
