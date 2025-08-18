module.exports = {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  // Por padrão o Jest ignora node_modules; aqui “re‐incluímos” o axios-cookiejar-support
  transformIgnorePatterns: [
    "/node_modules/(?!(axios-cookiejar-support)/)"
  ],
  testEnvironment: "node"
};
