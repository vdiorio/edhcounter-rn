import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {Typography} from '@/shared/ui';
import {useAppColors} from '@/features/theming';
import type {RootStackParamList} from '@/app/navigation/types';

type CdmgRouteProp = RouteProp<RootStackParamList, 'Cdmg'>;

export default function CdmgScreen(): React.JSX.Element {
  const route = useRoute<CdmgRouteProp>();
  const colors = useAppColors();
  return (
    <View
      testID="screen-cdmg"
      style={[styles.root, {backgroundColor: colors.background}]}>
      <Typography variant="title">Cdmg (target {route.params.targetPlayerId})</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
