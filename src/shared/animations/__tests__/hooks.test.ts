import {renderHook, act} from '@testing-library/react-native';
import {
  useAutoAdjustmentAnimation,
  useSliderAnimation,
} from '../hooks';

describe('useAutoAdjustmentAnimation', () => {
  it('returns SharedValues for width/height/opacity/scale', () => {
    const {result} = renderHook(() => useAutoAdjustmentAnimation(false));
    expect(result.current.width).toBeDefined();
    expect(result.current.height).toBeDefined();
    expect(result.current.opacity).toBeDefined();
    expect(result.current.scale).toBeDefined();
  });

  it('idle state has scale=1, opacity=1', () => {
    const {result} = renderHook(() => useAutoAdjustmentAnimation(false));
    expect(result.current.scale.value).toBe(1);
    expect(result.current.opacity.value).toBe(1);
  });

  it('shouldExit=true sets scale and opacity to 0', () => {
    const {result, rerender} = renderHook(
      ({exit}: {exit: boolean}) => useAutoAdjustmentAnimation(exit),
      {initialProps: {exit: false}},
    );
    expect(result.current.scale.value).toBe(1);
    act(() => {
      rerender({exit: true});
    });
    expect(result.current.scale.value).toBe(0);
    expect(result.current.opacity.value).toBe(0);
  });
});

describe('useSliderAnimation', () => {
  it('returns SharedValues for highlightWidth and highlightLeft', () => {
    const {result} = renderHook(() => useSliderAnimation(false));
    expect(result.current.highlightWidth).toBeDefined();
    expect(result.current.highlightLeft).toBeDefined();
  });

  it('inactive state positions the highlight on the left', () => {
    const {result} = renderHook(() => useSliderAnimation(false));
    // In the mocked Reanimated env, withSpring/withTiming are pass-through —
    // we assert the discrete target values, not the eased curve.
    expect(result.current.highlightLeft.value).toBeLessThan(0.5);
  });

  it('active=true moves the highlight toward the right', () => {
    const {result, rerender} = renderHook(
      ({active}: {active: boolean}) => useSliderAnimation(active),
      {initialProps: {active: false}},
    );
    const initialLeft = result.current.highlightLeft.value;
    act(() => {
      rerender({active: true});
    });
    expect(result.current.highlightLeft.value).toBeGreaterThan(initialLeft);
  });
});
