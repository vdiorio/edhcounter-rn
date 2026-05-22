import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Typography} from '@/shared/ui';
import {useAppColors} from '@/features/theming';

export default function LayoutSelectorScreen(): React.JSX.Element {
  const colors = useAppColors();
  return (
    <View
      testID="screen-layout-selector"
      style={[styles.root, {backgroundColor: colors.background}]}>
      <Typography variant="title">EdhCounter</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
