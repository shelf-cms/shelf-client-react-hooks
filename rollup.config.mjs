import { nodeResolve } from '@rollup/plugin-node-resolve';
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const devMode = (process.env.NODE_ENV === 'development');

let common_plugins = [
  peerDepsExternal(),
  nodeResolve(),
  commonjs(),  
]

if(!devMode)
  common_plugins = [...common_plugins, terser({
    ecma: 2020,
    mangle: { toplevel: true },
    compress: {
      module: true,
      toplevel: true,
      unsafe_arrows: true,
      drop_console: !devMode,
      drop_debugger: !devMode
    },
    output: { quote_style: 1, comments: false }
  })
]

export default [
  {
    input: './src/index.js',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      // sourcemap: devMode ? 'inline' : false,
      sourcemap: devMode ? true : false,
    },
    plugins: [
      ...common_plugins, 
      babel({ 
        babelHelpers: 'bundled', 
        presets: ['@babel/preset-env'],
        exclude: "**/node_modules/**" 
      })    
    ],

  },
  {
    input: './src/index.js',
    output: { 
      file: 'dist/index.esm.mjs',
      format: 'es',
      sourcemap: devMode ? true : false,
    },
    plugins: common_plugins,
  },

];
