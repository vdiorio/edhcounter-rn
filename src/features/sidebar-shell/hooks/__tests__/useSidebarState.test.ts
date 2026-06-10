import {act, renderHook} from '@testing-library/react-native';
import {
  useSidebarState,
  SIDEBAR_EXIT_MS,
  resetAllSidebars,
} from '../useSidebarState';

describe('useSidebarState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllSidebars();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('starts with no bar selected', () => {
    const {result} = renderHook(() => useSidebarState(0));
    expect(result.current.selectedBar).toBeNull();
  });

  it('opens a bar when toggled from null', () => {
    const {result} = renderHook(() => useSidebarState(0));
    act(() => result.current.toggleBar('cdmg'));
    expect(result.current.selectedBar).toBe('cdmg');
  });

  it('clears when the same bar is toggled again', () => {
    const {result} = renderHook(() => useSidebarState(0));
    act(() => result.current.toggleBar('cdmg'));
    act(() => result.current.toggleBar('cdmg'));
    expect(result.current.selectedBar).toBeNull();
  });

  it('clears immediately when toggled with null', () => {
    const {result} = renderHook(() => useSidebarState(0));
    act(() => result.current.toggleBar('history'));
    act(() => result.current.toggleBar(null));
    expect(result.current.selectedBar).toBeNull();
  });

  it('flips through null then to the new bar when switching', () => {
    const {result} = renderHook(() => useSidebarState(0));
    act(() => result.current.toggleBar('cdmg'));

    act(() => result.current.toggleBar('history'));
    // exit phase: cleared so the slot can play exit-then-enter
    expect(result.current.selectedBar).toBeNull();

    act(() => jest.advanceTimersByTime(SIDEBAR_EXIT_MS));
    expect(result.current.selectedBar).toBe('history');
  });

  it('keeps state independent per hook instance', () => {
    const a = renderHook(() => useSidebarState(0));
    const b = renderHook(() => useSidebarState(1));

    act(() => a.result.current.toggleBar('cdmg'));

    expect(a.result.current.selectedBar).toBe('cdmg');
    expect(b.result.current.selectedBar).toBeNull();
  });
});
