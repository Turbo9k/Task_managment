module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'space-before-function-paren': 'off',
    'quotes': 'off',
    'semi': 'off',
    'no-trailing-spaces': 'off',
    'indent': 'off',
    'eol-last': 'off',
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'computed-property-spacing': 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'space-in-parens': 'off',
    'space-infix-ops': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'template-curly-spacing': 'off',
    'arrow-spacing': 'off',
    'block-spacing': 'off',
    'brace-style': 'off',
    'camelcase': 'off',
    'comma-spacing': 'off',
    'comma-style': 'off',
    'func-call-spacing': 'off',
    'no-multiple-empty-lines': 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'error'
  }
}
