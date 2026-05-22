import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useGameStore} from '@/store/gameStore';
import {Typography} from '@/shared/ui';
import {STARTING_LIFE_TOTAL} from '@/store/constants/game';
import {BORDER_COLOR} from '@/shared/constants/ui';

type Props = {
  playerId: number;
};

export function HistorySideBar({playerId}: Props): React.JSX.Element {
  const {t} = useTranslation();
  const history = useGameStore(s => s.players[playerId]?.history ?? []);

  const totals = useMemo(() => {
    let running = STARTING_LIFE_TOTAL;
    return history.map(entry => {
      running += entry;
      return running;
    });
  }, [history]);

  return (
    <View style={styles.root}>
      <Typography variant="label" style={styles.title}>
        {t('history')}
      </Typography>
      <ScrollView contentContainerStyle={styles.list}>
        {history.map((entry, i) => {
          const positive = entry > 0;
          const color = positive ? '#00FF00' : '#FF0000';
          const text = positive ? `+${entry}` : `${entry}`;
          return (
            <View
              key={i}
              style={[styles.row, {backgroundColor: `${color}1a`}]}>
              <Typography
                testID={`history-total-${i}`}
                style={styles.totalMarker}
                numberOfLines={1}>
                {totals[i]}
              </Typography>
              <Typography
                testID={`history-entry-${i}`}
                style={[styles.entry, {color}]}
                numberOfLines={1}>
                {text}
              </Typography>
            </View>
          );
        })}
        <View style={styles.row}>
          <Typography
            testID="history-baseline"
            style={styles.totalMarker}
            numberOfLines={1}>
            {STARTING_LIFE_TOTAL}
          </Typography>
          <Typography style={styles.entry} numberOfLines={1}>
            —
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, width: '100%'},
  title: {
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: '#000',
  },
  list: {
    alignItems: 'stretch',
    flexDirection: 'column-reverse',
  },
  row: {
    position: 'relative',
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
  totalMarker: {
    position: 'absolute',
    left: 6,
    fontSize: 10,
    top: 6,
  },
  entry: {
    textAlign: 'right',
    fontSize: 18,
  },
});
