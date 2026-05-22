import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGameStore} from '@/store/gameStore';
import {computeLayoutPieces} from '../utils/computeLayout';
import type {GameLayoutTuple, LayoutGeometry} from '../types';

export function useLayoutGenerator(): LayoutGeometry {
  const gameLayout = useGameStore(s => s.gameLayout);
  const dims = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const containerWidth = Math.max(0, dims.width - insets.left - insets.right);
  const containerHeight = Math.max(0, dims.height - insets.top - insets.bottom);
  const pieces = computeLayoutPieces(
    gameLayout as unknown as GameLayoutTuple,
    containerWidth,
    containerHeight,
  );
  return {pieces, containerWidth, containerHeight};
}
