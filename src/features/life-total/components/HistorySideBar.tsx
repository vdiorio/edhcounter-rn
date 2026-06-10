import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View, type ListRenderItemInfo} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useGameStore} from '@/store/gameStore';
import {Typography} from '@/shared/ui';
import {STARTING_LIFE_TOTAL} from '@/store/constants/game';
import {BORDER_COLOR} from '@/shared/constants/ui';

type Props = {
  playerId: number;
};

type HistoryRowData = {
  entry: number;
  total: number;
};

type HistoryRowProps = HistoryRowData & {
  index: number;
};

const HistoryRow = React.memo(function HistoryRow({
  entry,
  total,
  index,
}: HistoryRowProps): React.JSX.Element {
  const positive = entry > 0;
  const text = positive ? `+${entry}` : `${entry}`;
  return (
    <View style={[styles.row, positive ? styles.rowGain : styles.rowLoss]}>
      <Typography
        testID={`history-total-${index}`}
        style={styles.totalMarker}
        numberOfLines={1}>
        {total}
      </Typography>
      <Typography
        testID={`history-entry-${index}`}
        style={[styles.entry, positive ? styles.entryGain : styles.entryLoss]}
        numberOfLines={1}>
        {text}
      </Typography>
    </View>
  );
});

function keyExtractor(_: HistoryRowData, index: number): string {
  return String(index);
}

function renderHistoryRow({
  item,
  index,
}: ListRenderItemInfo<HistoryRowData>): React.JSX.Element {
  return <HistoryRow entry={item.entry} total={item.total} index={index} />;
}

export function HistorySideBar({playerId}: Props): React.JSX.Element {
  const {t} = useTranslation();
  const history = useGameStore(s => s.players[playerId]?.history ?? []);

  const rows = useMemo<HistoryRowData[]>(() => {
    let running = STARTING_LIFE_TOTAL;
    return history.map(entry => {
      running += entry;
      return {entry, total: running};
    });
  }, [history]);

  return (
    <View style={styles.root}>
      <Typography variant="label" style={styles.title}>
        {t('history')}
      </Typography>
      <FlatList
        inverted
        style={styles.list}
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderHistoryRow}
        ListFooterComponent={
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
        }
      />
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
    flex: 1,
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
  rowGain: {
    backgroundColor: '#00FF001a',
  },
  rowLoss: {
    backgroundColor: '#FF00001a',
  },
  entryGain: {
    color: '#00FF00',
  },
  entryLoss: {
    color: '#FF0000',
  },
});
