import React, {useEffect, useState} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from '@/app/navigation/RootNavigator';
import {initI18n} from '@/features/i18n';

export default function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initI18n().then(() => {
      if (!cancelled) setReady(true);
    });
    if (Platform.OS === 'android') {
      SystemNavigationBar.setNavigationColor('#1e1d22', 'dark');
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const onNavReady = (): void => {
    BootSplash.hide({fade: true});
  };

  if (!ready) {
    return (
      <View testID="app-root" style={styles.boot}>
        <StatusBar barStyle="light-content" backgroundColor="#1e1d22" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <View testID="app-root" style={styles.flex}>
          <StatusBar barStyle="light-content" backgroundColor="#1e1d22" />
          <NavigationContainer onReady={onNavReady}>
            <RootNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  boot: {flex: 1, backgroundColor: '#1e1d22'},
});
