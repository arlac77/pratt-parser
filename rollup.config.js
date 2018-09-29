import json from "rollup-plugin-json";
import cleanup from 'rollup-plugin-cleanup';
import executable from 'rollup-plugin-executable';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
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
