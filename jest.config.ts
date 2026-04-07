/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // O preset 'ts-jest' configura automaticamente a maior parte do necessário para TypeScript
  preset: 'ts-jest',

  // O ambiente de teste que será usado. 'node' é o padrão para backend.
  testEnvironment: 'node',

  // Limpa mocks, instâncias, contextos e resultados antes de cada teste
  clearMocks: true,

  // Indica que a cobertura de código deve ser coletada durante os testes
  collectCoverage: true,

  // O diretório onde o Jest deve gerar os relatórios de cobertura
  coverageDirectory: 'coverage',

  // O provedor de cobertura de código. 'v8' é mais rápido e integrado com o Node.js.
  coverageProvider: 'v8',

  // Define de quais arquivos a cobertura deve ser coletada.
  // Ignoramos o main.ts, arquivos de módulo, e os próprios arquivos de teste.
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/domain/entity/*.entity.ts',
    '!src/**/domain/interface/*.interface.ts',
  ],

  // As extensões de arquivo que seus módulos usam
  moduleFileExtensions: ['js', 'json', 'ts'],

  // O diretório raiz que o Jest deve escanear para testes e módulos
  // '.' significa a raiz do projeto (onde está o package.json)
  rootDir: '.',

  // O padrão que o Jest usa para detectar arquivos de teste
  testRegex: '.*\\.spec\\.ts$',

  // Um mapa de expressões regulares para transformadores de módulo
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Mapeia os caminhos do tsconfig.json para que o Jest entenda importações
  // como 'src/users/...' em vez de caminhos relativos '../../'
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
