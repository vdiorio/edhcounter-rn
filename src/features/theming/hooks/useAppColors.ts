import {useColorScheme} from 'react-native';
import {AppColorsByScheme, type AppColors} from '../constants/theme';

export function useAppColors(): AppColors {
  const scheme = useColorScheme() ?? 'dark';
  return scheme === 'light' ? AppColorsByScheme.light : AppColorsByScheme.dark;
}
