module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test", "<rootDir>/lambdas"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
