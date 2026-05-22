import React from 'react';
import {render, screen, act} from '@testing-library/react-native';
import App from '@/App';

async function flushPromises() {
  await act(async () => {
    await new Promise<void>(r => setTimeout(() => r(), 0));
  });
}

describe('App', () => {
  it('renders an app-root element', async () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeTruthy();
    await flushPromises();
  });

  it('mounts the LayoutSelector screen once i18n init resolves', async () => {
    render(<App />);
    await flushPromises();
    expect(screen.getByTestId('screen-layout-selector')).toBeTruthy();
  });
});
