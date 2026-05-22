import React from 'react';
import {Text} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {AppModal} from '../AppModal';

describe('AppModal', () => {
  it('renders nothing when visible is false', () => {
    const {queryByTestId} = render(
      <AppModal visible={false} onRequestClose={() => {}}>
        <Text>child</Text>
      </AppModal>,
    );
    expect(queryByTestId('app-modal-backdrop')).toBeNull();
  });

  it('renders a backdrop and content when visible is true', () => {
    const {getByTestId, getByText} = render(
      <AppModal visible={true} onRequestClose={() => {}}>
        <Text>child</Text>
      </AppModal>,
    );
    expect(getByTestId('app-modal-backdrop')).toBeTruthy();
    expect(getByText('child')).toBeTruthy();
  });

  it('renders the title above children when provided', () => {
    const {getByText} = render(
      <AppModal visible={true} onRequestClose={() => {}} title="Confirm">
        <Text>child</Text>
      </AppModal>,
    );
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('tapping the backdrop calls onRequestClose', () => {
    const onRequestClose = jest.fn();
    const {getByTestId} = render(
      <AppModal visible={true} onRequestClose={onRequestClose}>
        <Text>child</Text>
      </AppModal>,
    );
    fireEvent.press(getByTestId('app-modal-backdrop'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('tapping the content does NOT call onRequestClose', () => {
    const onRequestClose = jest.fn();
    const {getByTestId} = render(
      <AppModal visible={true} onRequestClose={onRequestClose}>
        <Text>child</Text>
      </AppModal>,
    );
    fireEvent.press(getByTestId('app-modal-content'));
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('forwards onRequestClose to the underlying Modal (Android back press)', () => {
    const onRequestClose = jest.fn();
    const {UNSAFE_getByType} = render(
      <AppModal visible={true} onRequestClose={onRequestClose}>
        <Text>child</Text>
      </AppModal>,
    );
    const {Modal} = require('react-native');
    const modalNode = UNSAFE_getByType(Modal);
    expect(typeof modalNode.props.onRequestClose).toBe('function');
    modalNode.props.onRequestClose();
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
