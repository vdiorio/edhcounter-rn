import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {LayoutGenerator} from '@/features/game-layout';
import {useAppColors} from '@/features/theming';
import type {RootStackParamList} from '@/app/navigation/types';
import {CdmgBox} from './CdmgBox';

type CdmgRouteProp = RouteProp<RootStackParamList, 'Cdmg'>;

export function CdmgScreen(): React.JSX.Element {
  const route = useRoute<CdmgRouteProp>();
  const colors = useAppColors();

  return (
    <View testID="screen-cdmg" style={[styles.root, {backgroundColor: colors.background}]}> 
      <LayoutGenerator
        renderPiece={({playerId}) => (
          <CdmgBox targetPlayerId={route.params.targetPlayerId} attackerId={playerId} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});