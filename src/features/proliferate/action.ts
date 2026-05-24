import type {GameStore} from '@/store/gameStore';

type CounterKey = 'poison' | 'energy' | 'experience';

type CounterDelta = {
  playerId: number;
  key: CounterKey;
  delta: number;
};

type ProliferateRecord = {
  counterDeltas: CounterDelta[];
};

const undoStackByPlayer = new Map<number, ProliferateRecord[]>();

function pushRecord(playerId: number, record: ProliferateRecord): void {
  const stack = undoStackByPlayer.get(playerId) ?? [];
  undoStackByPlayer.set(playerId, [...stack, record]);
}

function popRecord(playerId: number): ProliferateRecord | undefined {
  const stack = undoStackByPlayer.get(playerId) ?? [];
  if (stack.length === 0) return undefined;
  const record = stack[stack.length - 1];
  undoStackByPlayer.set(playerId, stack.slice(0, -1));
  return record;
}

function applyDelta(players: GameStore['players'], delta: CounterDelta): GameStore['players'] {
  const current = players[delta.playerId];
  if (!current) return players;
  return {
    ...players,
    [delta.playerId]: {
      ...current,
      [delta.key]: Math.max(0, current[delta.key] + delta.delta),
    },
  };
}

export function getProliferateUndoCount(playerId: number): number {
  return (undoStackByPlayer.get(playerId) ?? []).length;
}

export function clearProliferateUndoStack(): void {
  undoStackByPlayer.clear();
}

export function proliferateAction(state: GameStore, playerId: number): Partial<GameStore> {
  const caller = state.players[playerId];
  if (!caller) return {players: state.players};

  const deltas: CounterDelta[] = [];

  if (caller.energy > 0) {
    deltas.push({playerId, key: 'energy', delta: 1});
  }
  if (caller.experience > 0) {
    deltas.push({playerId, key: 'experience', delta: 1});
  }

  Object.entries(state.players).forEach(([id, p]) => {
    const targetId = Number(id);
    if (targetId === playerId) return;
    if (p.poison > 0) {
      deltas.push({playerId: targetId, key: 'poison', delta: 1});
    }
  });

  if (deltas.length === 0) {
    return {players: state.players};
  }

  let players = state.players;
  deltas.forEach(delta => {
    players = applyDelta(players, delta);
  });

  pushRecord(playerId, {counterDeltas: deltas});
  return {players};
}

export function undoProliferateAction(
  state: GameStore,
  playerId: number,
  _occurrenceIndex: number,
): Partial<GameStore> {
  const record = popRecord(playerId);
  if (!record) return {players: state.players};

  let players = state.players;
  record.counterDeltas.forEach(delta => {
    players = applyDelta(players, {...delta, delta: -delta.delta});
  });

  return {players};
}