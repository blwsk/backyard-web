module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./pages/**/*.tsx", "./lib/**/*.tsx", "./components/**/*.tsx"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
