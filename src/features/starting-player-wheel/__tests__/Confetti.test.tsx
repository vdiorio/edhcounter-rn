import React from 'react';
import {render} from '@testing-library/react-native';
import {Confetti} from '../components/Confetti';

describe('Confetti', () => {
  it('renders the configured number of particles when active', () => {
    const {getByTestId} = render(<Confetti active particleCount={5} />);

    expect(getByTestId('confetti-particle-0')).toBeTruthy();
    expect(getByTestId('confetti-particle-1')).toBeTruthy();
    expect(getByTestId('confetti-particle-2')).toBeTruthy();
    expect(getByTestId('confetti-particle-3')).toBeTruthy();
    expect(getByTestId('confetti-particle-4')).toBeTruthy();
  });

  it('unmounts particles when active becomes false', () => {
    const {queryByTestId, rerender} = render(<Confetti active particleCount={3} />);
    expect(queryByTestId('confetti-particle-0')).toBeTruthy();

    rerender(<Confetti active={false} particleCount={3} />);

    expect(queryByTestId('confetti-particle-0')).toBeNull();
  });
});