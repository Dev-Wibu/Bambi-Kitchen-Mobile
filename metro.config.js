const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
  inlineRem: 16,
});

config.resolver.unstable_enablePackageExports = false;

module.exports = {
  ...config,
  symbolicator: {
    ...config.symbolicator,
    customizeFrame(frame) {
      if (frame.file?.endsWith("InternalBytecode.js")) {
        return {
          ...frame,
          collapse: true,
          file: undefined,
          lineNumber: undefined,
          column: undefined,
        };
      }

      return config.symbolicator?.customizeFrame
        ? config.symbolicator.customizeFrame(frame)
        : frame;
    },
  },
};
