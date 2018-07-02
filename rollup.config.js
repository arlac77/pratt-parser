import pkg from './package.json';

export default {
  output: {
    file: pkg.main,
    format: 'cjs',
    interop: false
  },

  plugins: [],

  input: pkg.module
};
