import {useStyleStore} from '../store/styleStore';

export function usePlayerColor(playerId: number): string {
  const palette = useStyleStore(state => state.playerColors);
  return palette[playerId % palette.length] as string;
}
