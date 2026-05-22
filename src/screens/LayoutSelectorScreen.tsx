import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {Typography} from '@/shared/ui';
import {useAppColors} from '@/features/theming';
import type {RootStackParamList} from '@/app/navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LayoutSelector'>;

// Interim layout until Spec 05 (layout-selector) ships the full home screen.
// Today this lets the user jump into a 2/3/4 player game so Spec 07+08 are
// reachable from a real device.
const PLAYER_OPTIONS = [2, 3, 4] as const;

export default function LayoutSelectorScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const colors = useAppColors();
  const {t} = useTranslation();

  return (
    <View
      testID="screen-layout-selector"
      style={[styles.root, {backgroundColor: colors.background}]}>
      <Typography variant="title" style={styles.title}>
        {t('app_title')}
      </Typography>
      <Typography variant="label" style={styles.subtitle}>
        {t('subtitle')}
      </Typography>

      <View style={styles.actions}>
        {PLAYER_OPTIONS.map(count => (
          <Pressable
            key={count}
            testID={`start-${count}p`}
            onPress={() => navigation.navigate('Game', {numPlayers: count})}
            style={({pressed}) => [
              styles.button,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Typography>{t('player_count_option', {count})}</Typography>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {marginBottom: 8},
  subtitle: {marginBottom: 32},
  actions: {alignSelf: 'stretch', gap: 12},
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
