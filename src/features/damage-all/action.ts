import type {GameStore} from '@/store/gameStore';

export function damageAllAction(
  state: GameStore,
  callerId: number,
  value: number,
): Partial<GameStore> {
  const players = Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => {
      if (Number(id) === callerId) {
        return [id, player];
      }

      return [
        id,
        {
          ...player,
          lTotal: player.lTotal + value,
          delta: player.delta + value,
        },
      ];
    }),
  ) as GameStore['players'];

  return {players};
}