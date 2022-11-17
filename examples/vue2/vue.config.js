const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.resolve.alias.set(
      "simple-micro-app",
      path.join(__dirname, "../../src/index.js")
    );
  },
})
