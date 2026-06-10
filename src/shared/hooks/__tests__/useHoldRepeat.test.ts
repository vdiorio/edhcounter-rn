import {renderHook, act} from '@testing-library/react-native';
import {useHoldRepeat} from '../useHoldRepeat';

const DELAY = 350;
const INTERVAL = 100;

function setup(overrides: Partial<Parameters<typeof useHoldRepeat>[0]> = {}) {
  const onTap = jest.fn();
  const onHoldStart = jest.fn();
  const onHoldTick = jest.fn();
  const {result, unmount} = renderHook(() =>
    useHoldRepeat({
      onTap,
      onHoldStart,
      onHoldTick,
      delayMs: DELAY,
      intervalMs: INTERVAL,
      ...overrides,
    }),
  );
  return {onTap, onHoldStart, onHoldTick, result, unmount};
}

describe('useHoldRepeat', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fires onTap on a plain tap with no hold', () => {
    const {onTap, onHoldTick, result} = setup();
    act(() => {
      result.current.onPressIn();
      result.current.onPressOut();
      result.current.onTap();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onHoldTick).not.toHaveBeenCalled();
  });

  it('does not fire onTap or onHoldTick before the hold delay elapses', () => {
    const {onTap, onHoldStart, onHoldTick, result} = setup();
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(DELAY - 50);
    });
    expect(onTap).not.toHaveBeenCalled();
    expect(onHoldStart).not.toHaveBeenCalled();
    expect(onHoldTick).not.toHaveBeenCalled();
  });

  it('crossing the delay fires onHoldStart once and then ticks on the interval', () => {
    const {onHoldStart, onHoldTick, result} = setup();
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(DELAY);
    });
    expect(onHoldStart).toHaveBeenCalledTimes(1);
    // default tickOnHoldStart=false → no immediate tick at the threshold
    expect(onHoldTick).toHaveBeenCalledTimes(0);

    act(() => {
      jest.advanceTimersByTime(INTERVAL * 3);
    });
    expect(onHoldTick).toHaveBeenCalledTimes(3);
    expect(onHoldStart).toHaveBeenCalledTimes(1);
  });

  it('tickOnHoldStart fires one tick immediately at the threshold', () => {
    const {onHoldTick, result} = setup({tickOnHoldStart: true});
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(DELAY);
    });
    expect(onHoldTick).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(INTERVAL * 2);
    });
    expect(onHoldTick).toHaveBeenCalledTimes(3);
  });

  it('suppresses the trailing onTap after a hold', () => {
    const {onTap, result} = setup();
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(DELAY + INTERVAL);
      result.current.onPressOut();
      result.current.onTap();
    });
    expect(onTap).not.toHaveBeenCalled();

    // the next, clean tap is not suppressed
    act(() => {
      result.current.onPressIn();
      result.current.onPressOut();
      result.current.onTap();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('onPressOut cancels the repeat interval', () => {
    const {onHoldTick, result} = setup();
    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(DELAY + INTERVAL * 2);
    });
    const callsAtRelease = onHoldTick.mock.calls.length;
    act(() => {
      result.current.onPressOut();
      jest.advanceTimersByTime(INTERVAL * 5);
    });
    expect(onHoldTick).toHaveBeenCalledTimes(callsAtRelease);
  });

  it('unmount clears pending timers', () => {
    const {result, unmount} = setup();
    act(() => {
      result.current.onPressIn();
    });
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
