import React from 'react';
import Animated, {type AnimatedProps} from 'react-native-reanimated';
import type {TextProps, TextStyle} from 'react-native';
import {useAppColors} from '@/features/theming';

export type TypographyVariant = 'body' | 'title' | 'label';

export type TypographyProps = AnimatedProps<TextProps> & {
  variant?: TypographyVariant;
  color?: string;
};

const VARIANT_FONT_SIZE: Record<TypographyVariant, number> = {
  body: 14,
  title: 24,
  label: 12,
};

export function Typography({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: TypographyProps): React.JSX.Element {
  const colors = useAppColors();
  const themeColor = variant === 'label' ? colors.textSecondary : colors.text;
  const resolvedColor = color ?? themeColor;

  const variantStyle: TextStyle = {
    color: resolvedColor,
    fontSize: VARIANT_FONT_SIZE[variant],
  };

  return (
    <Animated.Text style={[variantStyle, style]} {...rest}>
      {children}
    </Animated.Text>
  );
}
