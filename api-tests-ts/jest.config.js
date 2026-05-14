module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  collectCoverageFrom: ['**/*.js'],
  coverageDirectory: 'coverage',
  reporters: [
    'default',
    ['allure-jest', {
      outputDir: 'allure-results'
    }]
  ]
};
