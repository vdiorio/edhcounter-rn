import React from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import {Lifetotal} from '@/features/life-total';
import {Typography} from '@/shared/ui';
import {useGameStore} from '@/store/gameStore';

type Props = {
  targetPlayerId: number;
  attackerId: number;
};

export function CdmgBox({targetPlayerId, attackerId}: Props): React.JSX.Element {
  const chain = useGameStore(s => s.players[targetPlayerId]?.chain ?? false);
  const togglePlayerChain = useGameStore(s => s.togglePlayerChain);
  const primaryValue = useGameStore(s => s.players[targetPlayerId]?.Cdmg[attackerId]?.[0] ?? 0);
  const partnerValue = useGameStore(s => s.players[targetPlayerId]?.Cdmg[attackerId]?.[1] ?? 0);

  return (
    <View testID={`cdmg-box-${targetPlayerId}-${attackerId}`} style={styles.root}>
      {attackerId === targetPlayerId ? (
        <>
          <Lifetotal playerId={targetPlayerId} />
          <View style={styles.chainRow}>
            <Typography variant="label">Chain</Typography>
            <Switch
              testID={`cdmg-box-${targetPlayerId}-chain`}
              value={chain}
              onValueChange={() => togglePlayerChain(targetPlayerId)}
            />
          </View>
        </>
      ) : (
        <>
          <Typography variant="label">{`P${attackerId + 1}`}</Typography>
          <Typography>{primaryValue}</Typography>
          {partnerValue > 0 ? <Typography variant="label">{`Partner ${partnerValue}`}</Typography> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});