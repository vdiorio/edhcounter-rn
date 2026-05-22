import {renderHook} from '@testing-library/react-native';
import {useDeltaAnimation, DELTA_POSITIVE_COLOR, DELTA_NEGATIVE_COLOR} from '../hooks/useDeltaAnimation';

describe('useDeltaAnimation', () => {
  it('produces empty signedString when delta is 0', () => {
    const {result} = renderHook(() => useDeltaAnimation(0));
    expect(result.current.signedString).toBe('');
  });

  it('produces "+5" and the lime color for a positive delta', () => {
    const {result} = renderHook(() => useDeltaAnimation(5));
    expect(result.current.signedString).toBe('+5');
    expect(result.current.color).toBe(DELTA_POSITIVE_COLOR);
  });

  it('produces "-3" and the red color for a negative delta', () => {
    const {result} = renderHook(() => useDeltaAnimation(-3));
    expect(result.current.signedString).toBe('-3');
    expect(result.current.color).toBe(DELTA_NEGATIVE_COLOR);
  });

  it('exposes a translateY shared value', () => {
    const {result} = renderHook(() => useDeltaAnimation(2));
    expect(result.current.translateY).toBeDefined();
    expect(typeof result.current.translateY.value).toBe('number');
  });
});
