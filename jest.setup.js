jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  show: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-system-navigation-bar', () => ({
  setNavigationColor: jest.fn(),
  setBarMode: jest.fn(),
}));
