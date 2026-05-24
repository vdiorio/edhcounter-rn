import * as ReactNative from 'react-native';
import {useGameStore} from '@/store/gameStore';
import {computeLayoutPieces} from '../utils/computeLayout';
import type {GameLayoutTuple, LayoutGeometry} from '../types';

export function getLayoutContainerSize(
  windowDims: Pick<ReactNative.ScaledSize, 'width' | 'height'>,
  screenDims: Pick<ReactNative.ScaledSize, 'width' | 'height'>,
  os: ReactNative.PlatformOSType,
): Pick<LayoutGeometry, 'containerWidth' | 'containerHeight'> {
  const width = os === 'android' ? Math.max(windowDims.width, screenDims.width) : windowDims.width;
  const height =
    os === 'android' ? Math.max(windowDims.height, screenDims.height) : windowDims.height;

  return {
    containerWidth: Math.max(0, width),
    containerHeight: Math.max(0, height),
  };
}

export function useLayoutGenerator(): LayoutGeometry {
  const gameLayout = useGameStore(s => s.gameLayout);
  const windowDims = ReactNative.useWindowDimensions();
  const screenDims = ReactNative.Dimensions.get('screen');
  const {containerWidth, containerHeight} = getLayoutContainerSize(
    windowDims,
    screenDims,
    ReactNative.Platform.OS,
  );
  const pieces = computeLayoutPieces(
    gameLayout as unknown as GameLayoutTuple,
    containerWidth,
    containerHeight,
  );
  return {pieces, containerWidth, containerHeight};
}
