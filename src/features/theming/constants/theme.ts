export type AppColors = {
  background: string;
  backgroundGradient: string;
  surface: string;
  surfaceAccent: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: {
    green: string;
    white: string;
    black: string;
  };
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  selected: {
    background: string;
    text: string;
  };
  unselected: {
    background: string;
    text: string;
  };
};

export const AppColorsByScheme: {dark: AppColors; light: AppColors} = {
  dark: {
    background: '#151515',
    backgroundGradient: '#0D0D0D',
    surface: '#222222',
    surfaceAccent: '#2A2A2A',
    primary: '#4285F4',
    primaryDark: '#3367D6',
    secondary: '#EA4335',
    secondaryDark: '#C62828',
    accent: {
      green: '#34A853',
      white: '#F0F0F0',
      black: '#121212',
    },
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#707070',
    border: '#333333',
    selected: {
      background: '#263238',
      text: '#FFFFFF',
    },
    unselected: {
      background: '#1E1E1E',
      text: '#888888',
    },
  },
  light: {
    background: '#F5F5F5',
    backgroundGradient: '#E8E8E8',
    surface: '#FFFFFF',
    surfaceAccent: '#F0F0F0',
    primary: '#4285F4',
    primaryDark: '#3367D6',
    secondary: '#EA4335',
    secondaryDark: '#C62828',
    accent: {
      green: '#34A853',
      white: '#F8F8F8',
      black: '#212121',
    },
    text: '#212121',
    textSecondary: '#5F6368',
    textMuted: '#9AA0A6',
    border: '#DADCE0',
    selected: {
      background: '#E8F0FE',
      text: '#1A73E8',
    },
    unselected: {
      background: '#F1F3F4',
      text: '#5F6368',
    },
  },
};
