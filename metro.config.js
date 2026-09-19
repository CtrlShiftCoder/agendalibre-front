const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  // Web: never pull lottie-react-native (needs @lottiefiles/dotlottie-react).
  if (
    platform === 'web' &&
    (moduleName === 'lottie-react-native' ||
      moduleName.startsWith('lottie-react-native/'))
  ) {
    return {
      filePath: path.resolve(__dirname, 'lib/lottieStub.web.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
