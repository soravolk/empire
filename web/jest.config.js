module.exports = {
  // Extend the default CRA Jest configuration
  preset: "react-scripts",

  // Test environment
  testEnvironment: "jsdom",

  // Setup files after environment
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
