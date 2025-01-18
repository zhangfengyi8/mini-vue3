// import pkg from './package.json' assert { type: 'json' }
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "lib/guide-mini-vue.cjs.js",
      format: "cjs",
    },
    {
      file: "lib/guide-mini-vue.esm.js",
      format: "esm",
    },
  ],

  plugins: [typescript()],
};
