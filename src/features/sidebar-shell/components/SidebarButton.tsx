import React, {memo} from 'react';
import {Pressable, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {BORDER_COLOR, DEFAULT_PLAYER_COLOR} from '@/shared/constants/ui';

type Props = {
  /** Ionicons name. */
  icon: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export const SidebarButton = memo(function SidebarButton({
  icon,
  selected,
  onPress,
  color = DEFAULT_PLAYER_COLOR,
  testID,
  style,
}: Props): React.JSX.Element {
  const tint = selected ? color : '#ffffff';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[
        styles.button,
        {borderColor: tint, backgroundColor: selected ? `${color}25` : undefined},
        style,
      ]}>
      <Ionicons name={icon} size={22} color={tint} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
  },
});
