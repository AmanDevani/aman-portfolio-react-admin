// eslint-disable-next-line import/no-extraneous-dependencies
const CracoLessPlugin = require('craco-less');
const { theme } = require('antd/lib');

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: mapToken,
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
