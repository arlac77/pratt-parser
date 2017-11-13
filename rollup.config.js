import pkg from './package.json';

export default {
  output: {
    file: pkg.main,
    format: 'cjs'
  },

  plugins: [],

  input: pkg.module
};
