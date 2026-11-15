// Expo configures Metro for monorepos automatically (SDK 52+): workspace packages are
// watched and resolved without custom watchFolders or nodeModulesPaths.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
