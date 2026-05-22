import React from 'react';
import {Text} from 'react-native';
import {render} from '@testing-library/react-native';
import {Rotator} from '../components/Rotator';

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter(Boolean));
  }
  return (style as Record<string, unknown>) ?? {};
}

describe('Rotator', () => {
  it('renders children as-is at direction 0', () => {
    const {getByText, getByTestId} = render(
      <Rotator direction={0} width={200} height={100}>
        <Text testID="child">inside</Text>
      </Rotator>,
    );
    expect(getByText('inside')).toBeTruthy();
    const inner = flattenStyle(getByTestId('rotator-inner').props.style);
    expect(inner.width).toBe(200);
    expect(inner.height).toBe(100);
  });

  it('rotates 180 degrees without swapping dimensions', () => {
    const {getByTestId} = render(
      <Rotator direction={180} width={200} height={100}>
        <Text>x</Text>
      </Rotator>,
    );
    const inner = flattenStyle(getByTestId('rotator-inner').props.style);
    expect(inner.width).toBe(200);
    expect(inner.height).toBe(100);
    expect(JSON.stringify(inner.transform)).toContain('180');
  });

  it('rotates 90 and swaps inner width/height', () => {
    const {getByTestId} = render(
      <Rotator direction={90} width={200} height={100}>
        <Text>x</Text>
      </Rotator>,
    );
    const inner = flattenStyle(getByTestId('rotator-inner').props.style);
    expect(inner.width).toBe(100);
    expect(inner.height).toBe(200);
    expect(JSON.stringify(inner.transform)).toContain('90');
  });

  it('rotates -90 and swaps inner width/height', () => {
    const {getByTestId} = render(
      <Rotator direction={-90} width={200} height={100}>
        <Text>x</Text>
      </Rotator>,
    );
    const inner = flattenStyle(getByTestId('rotator-inner').props.style);
    expect(inner.width).toBe(100);
    expect(inner.height).toBe(200);
    expect(JSON.stringify(inner.transform)).toContain('-90');
  });

  it('outer container always reports the slot dimensions', () => {
    const {getByTestId} = render(
      <Rotator direction={90} width={200} height={100}>
        <Text>x</Text>
      </Rotator>,
    );
    const outer = flattenStyle(getByTestId('rotator-outer').props.style);
    expect(outer.width).toBe(200);
    expect(outer.height).toBe(100);
  });
});
