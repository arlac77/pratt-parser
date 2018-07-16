import istanbul from 'rollup-plugin-istanbul';

import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  external: ['ava'],

  plugins: [multiEntry(), istanbul({
    exclude: ['tests/**/*-test.js']
  }), resolve(), commonjs()],

  output: {
    file: 'build/bundle-test.js',
    format: 'cjs',
    sourcemap: true,
    interop: false
  }
};
