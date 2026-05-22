import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export default function App(): React.JSX.Element {
  useEffect(() => {
    BootSplash.hide({ fade: true });
    if (Platform.OS === 'android') {
      SystemNavigationBar.setNavigationColor('#1e1d22', 'dark');
    }
  }, []);

  return (
    <View style={styles.root} testID="app-root">
      <StatusBar barStyle="light-content" backgroundColor="#1e1d22" />
      <Text style={styles.label}>EdhCounter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1e1d22', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#e0e0e0', fontSize: 24 },
});
