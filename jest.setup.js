// Reanimated mock
jest.mock('react-native-reanimated', () => {
  try {
    return require('react-native-reanimated/mock');
  } catch (e) {
    // Reanimated 4 may not ship the legacy mock — provide a minimal stub
    return {
      default: {},
      useSharedValue: (v) => ({ value: v }),
      useAnimatedStyle: (fn) => fn(),
      withTiming: (v) => v,
      withSpring: (v) => v,
      withDelay: (_, v) => v,
      runOnJS: (fn) => fn,
      Easing: { linear: (t) => t, ease: (t) => t },
    };
  }
});

// Worklets mock (Reanimated 4 dependency)
jest.mock('react-native-worklets', () => ({}), { virtual: true });

// Gesture handler mock
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
    GestureHandlerRootView: View,
    Gesture: {
      Pan: () => ({ onUpdate: () => ({}) }),
      Tap: () => ({ onEnd: () => ({}) }),
    },
    GestureDetector: View,
  };
});

// AsyncStorage mock (v3.x ships the mock at the /jest subpath export)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// react-native-localize mock — use jest.fn so tests can override return values
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    { countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false },
  ]),
  getCurrencies: jest.fn(() => ['USD']),
  getCountry: jest.fn(() => 'US'),
  getTimeZone: jest.fn(() => 'America/Los_Angeles'),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// react-native-bootsplash mock
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  show: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
}));

// system navigation bar mock
jest.mock('react-native-system-navigation-bar', () => ({
  setNavigationColor: jest.fn(),
  setBarMode: jest.fn(),
}));

// vector-icons mocks
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
