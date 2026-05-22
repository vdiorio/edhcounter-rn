import React from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {useAppColors} from '@/features/theming';
import {Typography} from './Typography';

export type AppModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function AppModal({
  visible,
  onRequestClose,
  title,
  children,
}: AppModalProps): React.JSX.Element | null {
  const colors = useAppColors();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}>
      <Pressable
        testID="app-modal-backdrop"
        style={styles.backdrop}
        onPress={onRequestClose}>
        <Pressable
          testID="app-modal-content"
          style={[styles.content, {backgroundColor: colors.surface}]}
          onPress={() => {
            // absorb taps inside the content card
          }}>
          {title ? (
            <Typography variant="title" style={styles.title}>
              {title}
            </Typography>
          ) : null}
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'stretch',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
});
