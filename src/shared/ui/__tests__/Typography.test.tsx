import React from 'react';
import {render} from '@testing-library/react-native';
import {Typography} from '../Typography';
import {AppColorsByScheme} from '@/features/theming';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'dark'),
}));

describe('Typography', () => {
  it('renders children inside an animated text node', () => {
    const {getByText} = render(<Typography>Hello</Typography>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('uses theme text color for the body variant', () => {
    const {getByText} = render(<Typography variant="body">x</Typography>);
    const node = getByText('x');
    const flat = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style.flat(Infinity).filter(Boolean))
      : node.props.style;
    expect(flat.color).toBe(AppColorsByScheme.dark.text);
  });

  it('uses the dim text color for the label variant', () => {
    const {getByText} = render(<Typography variant="label">x</Typography>);
    const node = getByText('x');
    const flat = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style.flat(Infinity).filter(Boolean))
      : node.props.style;
    expect(flat.color).toBe(AppColorsByScheme.dark.textSecondary);
  });

  it('color prop overrides the theme color', () => {
    const {getByText} = render(
      <Typography color="#ff0000">x</Typography>,
    );
    const node = getByText('x');
    const flat = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style.flat(Infinity).filter(Boolean))
      : node.props.style;
    expect(flat.color).toBe('#ff0000');
  });

  it('variant title applies a fontSize of 24', () => {
    const {getByText} = render(<Typography variant="title">x</Typography>);
    const node = getByText('x');
    const flat = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style.flat(Infinity).filter(Boolean))
      : node.props.style;
    expect(flat.fontSize).toBe(24);
  });

  it('passes through extra props (numberOfLines)', () => {
    const {getByText} = render(
      <Typography numberOfLines={2}>multi</Typography>,
    );
    expect(getByText('multi').props.numberOfLines).toBe(2);
  });
});
