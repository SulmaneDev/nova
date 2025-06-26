module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/tests/**/*.(spec|test).[tj]s?(x)'],
    transform: {
        '^.+\\.(t|j)sx?$': [
            '@swc/jest',
            {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                        tsx: false,
                        decorators: true,
                    },
                    transform: {
                        decoratorMetadata: true,
                    },
                    target: 'es2021',
                },
            },
        ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    clearMocks: true,
    resetMocks: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
