import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {Typography} from '@/shared/ui';
import {useAppColors} from '@/features/theming';
import {
  PLAYER_LAYOUTS,
  getPlayerLayout,
  type GameLayout,
} from '@/store/constants/playerLayouts';
import type {RootStackParamList} from '@/app/navigation/types';
import {LayoutVisualizer} from './LayoutVisualizer';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LayoutSelector'>;

const PLAYER_OPTIONS = [2, 3, 4, 5, 6] as const;
const VISUALIZER_WIDTH = 160;
const VISUALIZER_HEIGHT = 280;

function hasAltLayout(count: number): boolean {
  const pair = PLAYER_LAYOUTS[count];
  if (!pair) return false;
  const [primary, alt] = pair;
  return primary.some((v, i) => v !== alt[i]);
}

export function LayoutSelectorScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const colors = useAppColors();
  const {t} = useTranslation();

  const [playerCount, setPlayerCount] = useState<number>(4);
  const [alt, setAlt] = useState<boolean>(false);

  const layout: GameLayout = useMemo(
    () => getPlayerLayout(playerCount, alt),
    [playerCount, alt],
  );
  const altAvailable = hasAltLayout(playerCount);

  const onPickCount = (n: number) => {
    setPlayerCount(n);
    setAlt(false);
  };

  const onStart = () => {
    navigation.navigate('Game', {numPlayers: playerCount, alt});
  };

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

      <Typography variant="label" style={styles.sectionLabel}>
        {t('player_count_label')}
      </Typography>
      <View testID="player-count-picker" style={styles.picker}>
        {PLAYER_OPTIONS.map(n => {
          const selected = n === playerCount;
          return (
            <Pressable
              key={n}
              testID={`count-${n}`}
              accessibilityState={{selected}}
              onPress={() => onPickCount(n)}
              style={[
                styles.pickerItem,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <Typography color={selected ? colors.background : undefined}>
                {n}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {altAvailable ? (
        <>
          <Typography variant="label" style={styles.sectionLabel}>
            {t('table_layout_label')}
          </Typography>
          <View testID="alt-toggle" style={styles.altToggle}>
            <Pressable
              testID="alt-primary"
              accessibilityState={{selected: !alt}}
              onPress={() => setAlt(false)}
              style={[
                styles.altOption,
                {
                  backgroundColor: alt ? colors.surface : colors.primary,
                  borderColor: colors.border,
                },
              ]}>
              <Typography color={alt ? undefined : colors.background}>A</Typography>
            </Pressable>
            <Pressable
              testID="alt-alt"
              accessibilityState={{selected: alt}}
              onPress={() => setAlt(true)}
              style={[
                styles.altOption,
                {
                  backgroundColor: alt ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <Typography color={alt ? colors.background : undefined}>B</Typography>
            </Pressable>
          </View>
        </>
      ) : null}

      <View style={styles.visualizerWrap}>
        <LayoutVisualizer
          layout={layout}
          width={VISUALIZER_WIDTH}
          height={VISUALIZER_HEIGHT}
        />
      </View>

      <Pressable
        testID="start-game"
        onPress={onStart}
        style={({pressed}) => [
          styles.startButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.75 : 1,
          },
        ]}>
        <Typography color={colors.background}>{t('start_game')}</Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {marginBottom: 4},
  subtitle: {marginBottom: 16},
  sectionLabel: {marginTop: 4},
  picker: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerItem: {
    minWidth: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  altToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  altOption: {
    minWidth: 56,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  visualizerWrap: {
    marginTop: 16,
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
