import {renderHook, act} from '@testing-library/react-native';
import {useIncrementAction} from '../hooks/useIncrementAction';

const HOOK_OPTS = {intervalMs: 100, longPressDelayMs: 350};

describe('useIncrementAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('onPress fires onTick once when the platform skipped onPressIn (tap fallback)', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPress();
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('onPressIn + onPress (real device tap order) fires onTick only once', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
      result.current.onPressOut();
      result.current.onPress();
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('press-in fires once immediately and nothing else until the long-press delay elapses', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
    });
    expect(onTick).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onTick).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(100); // crosses the 350ms threshold
    });
    // long-press fired → interval starts and emits its first tick
    expect(onTick).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(300); // 3 more interval ticks
    });
    expect(onTick).toHaveBeenCalledTimes(5);
  });

  it('onPressOut before the long-press delay only leaves the single press-in tick', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(150);
      result.current.onPressOut();
      jest.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('onPressOut after the long-press delay cancels the rapid-fire interval', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(550); // press-in + long-press + 2 interval ticks
    });
    const callsAtRelease = onTick.mock.calls.length;
    expect(callsAtRelease).toBeGreaterThanOrEqual(3);
    act(() => {
      result.current.onPressOut();
      jest.advanceTimersByTime(1000);
    });
    expect(onTick).toHaveBeenCalledTimes(callsAtRelease);
  });

  it('a fresh onPressIn cancels the previous timers and restarts the long-press cycle', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(150);
      result.current.onPressIn();
    });
    // 1 (first press-in) + 1 (second press-in) — no long-press has triggered
    expect(onTick).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(450); // 350ms delay (one threshold tick) + 100ms (one interval tick)
    });
    expect(onTick).toHaveBeenCalledTimes(4);
  });

  it('unmount clears any pending timers', () => {
    const onTick = jest.fn();
    const {result, unmount} = renderHook(() => useIncrementAction({onTick, ...HOOK_OPTS}));
    act(() => {
      result.current.onPressIn();
    });
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
