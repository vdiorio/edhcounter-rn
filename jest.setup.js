// Reanimated mock — Reanimated 4 ships its mock as TS only, so we cannot
// require('react-native-reanimated/mock') from Jest without ts-node. Provide
// a manual mock that swaps Animated.<Text|View|...> for plain RN components
// and stubs the worklets API surface that components touch at test time.
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const View = RN.View;
  const Text = RN.Text;
  const Image = RN.Image;
  const ScrollView = RN.ScrollView;
  const FlatList = RN.FlatList;
  const Animated = {
    View,
    Text,
    Image,
    ScrollView,
    FlatList,
    createAnimatedComponent: (c) => c,
  };
  const useSharedValue = (v) => ({ value: v });
  const useDerivedValue = (fn) => ({ value: fn() });
  const useAnimatedStyle = (fn) => fn();
  const useAnimatedProps = (fn) => fn();
  const passthrough = (v) => v;
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming: passthrough,
    withSpring: passthrough,
    withDelay: (_d, v) => v,
    withRepeat: passthrough,
    withSequence: (...xs) => xs[xs.length - 1],
    cancelAnimation: () => {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    interpolate: (value, _input, output) => output[0],
    interpolateColor: (value, _input, output) => output[0],
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      inOut: (fn) => fn,
      bezier: () => (t) => t,
    },
  };
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

// safe-area-context — render children directly in tests
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 0, height: 0 };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
    SafeAreaInsetsContext: { Consumer: ({ children }) => children(inset) },
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets: inset, frame },
  };
});

// react-native-keep-awake — stub the NativeModules call site
jest.mock('react-native-keep-awake', () => ({
  __esModule: true,
  default: {
    activate: jest.fn(),
    deactivate: jest.fn(),
  },
}));
