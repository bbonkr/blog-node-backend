module.exports = {
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
    modulePathIgnorePatterns: ['node_modules'],
    globals: {
        'ts-jest': {
            diagnostics: true,
        },
    },
    preset: 'ts-jest',
    testMatch: null,
};
