module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-bootsplash|react-native-vector-icons|react-native-system-navigation-bar|react-native-keep-awake|react-native-linear-gradient|react-native-svg|react-native-localize|react-native-screens|react-native-safe-area-context|@react-native-async-storage)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
