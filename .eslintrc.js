module.exports = {
  'env': {
    'node': true,
    'browser': false,
    'es6': true,
  },
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
    },
    'sourceType': 'module',
  },
  'extends': [
    '@team-griffin/eslint-config/frontend-config/core',
    '@team-griffin/eslint-config/frontend-config/flowtype',
    '@team-griffin/eslint-config/frontend-config/import',
    '@team-griffin/eslint-config/frontend-config/jsx-a11y',
    '@team-griffin/eslint-config/frontend-config/react',
  ],
  'rules': {
    'import/no-nodejs-modules': 0
  }
};
