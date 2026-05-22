import {renderHook, act} from '@testing-library/react-native';
import {useIncrementAction} from '../hooks/useIncrementAction';

describe('useIncrementAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('onPress fires onTick exactly once (tap, no hold)', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() => useIncrementAction({onTick}));
    act(() => {
      result.current.onPress();
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('hold fires onTick once immediately and then every intervalMs', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() =>
      useIncrementAction({onTick, intervalMs: 100}),
    );
    act(() => {
      result.current.onPressIn();
    });
    expect(onTick).toHaveBeenCalledTimes(1); // immediate fire on press-in

    act(() => {
      jest.advanceTimersByTime(400);
    });
    // 4 additional ticks at 100ms each
    expect(onTick).toHaveBeenCalledTimes(5);
  });

  it('onPressOut cancels the interval', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() =>
      useIncrementAction({onTick, intervalMs: 100}),
    );
    act(() => {
      result.current.onPressIn();
    });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    act(() => {
      result.current.onPressOut();
    });
    const callsAtRelease = onTick.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onTick).toHaveBeenCalledTimes(callsAtRelease);
  });

  it('a fresh onPressIn cancels the previous interval and starts a new one', () => {
    const onTick = jest.fn();
    const {result} = renderHook(() =>
      useIncrementAction({onTick, intervalMs: 100}),
    );
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(150);
      result.current.onPressIn();
    });
    // 1 (first press-in) + 1 (first interval tick) + 1 (second press-in immediate) = 3
    expect(onTick).toHaveBeenCalledTimes(3);

    act(() => {
      jest.advanceTimersByTime(200);
    });
    // 2 more ticks after the second press-in
    expect(onTick).toHaveBeenCalledTimes(5);
  });

  it('unmount clears any pending interval', () => {
    const onTick = jest.fn();
    const {result, unmount} = renderHook(() =>
      useIncrementAction({onTick, intervalMs: 100}),
    );
    act(() => {
      result.current.onPressIn();
    });
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
