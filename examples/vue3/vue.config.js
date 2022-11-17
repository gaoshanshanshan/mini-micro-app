const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    extract: true,
  },
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
