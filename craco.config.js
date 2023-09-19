const CracoLessPlugin = require('craco-less');

module.exports = {
  devServer: {
    client: {
      overlay: false,  // disable full screen overlay
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
