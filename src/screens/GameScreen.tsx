import React, {useCallback, useEffect, useState} from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {useTranslation} from 'react-i18next';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppModal, Typography} from '@/shared/ui';
import {useAppColors} from '@/features/theming';
import {StartingPlayerButton} from '@/features/starting-player-wheel';
import {useGameStore} from '@/store/gameStore';
import {LayoutGenerator} from '@/features/game-layout';
import {PlayerBox} from '@/features/player-box';
import type {RootStackParamList} from '@/app/navigation/types';

type GameNavProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export default function GameScreen(): React.JSX.Element {
  const navigation = useNavigation<GameNavProp>();
  const route = useRoute<GameRouteProp>();
  const {t} = useTranslation();
  const colors = useAppColors();
  const setNumPlayers = useGameStore(s => s.setNumPlayers);
  const resetGame = useGameStore(s => s.resetGame);

  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    setNumPlayers({
      playerCount: route.params.numPlayers,
      alt: route.params.alt,
    });
  }, [route.params.numPlayers, route.params.alt, setNumPlayers]);

  useFocusEffect(
    useCallback(() => {
      KeepAwake.activate();
      StatusBar.setHidden(true, 'fade');
      if (Platform.OS === 'android') {
        SystemNavigationBar.stickyImmersive(true);
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setConfirmVisible(true);
        return true;
      });
      return () => {
        sub.remove();
        KeepAwake.deactivate();
        StatusBar.setHidden(false, 'fade');
        if (Platform.OS === 'android') {
          SystemNavigationBar.stickyImmersive(false);
        }
      };
    }, []),
  );

  const onConfirm = useCallback(() => {
    setConfirmVisible(false);
    resetGame();
    navigation.popToTop();
  }, [navigation, resetGame]);

  const onCancel = useCallback(() => setConfirmVisible(false), []);

  return (
    <View
      testID="screen-game"
      style={[styles.root, {backgroundColor: colors.background}]}>
      <LayoutGenerator
        renderPiece={({playerId, width, height}) => (
          <PlayerBox playerId={playerId} style={{width, height}} />
        )}
      />

      <StartingPlayerButton />

      <AppModal
        visible={confirmVisible}
        onRequestClose={onCancel}
        title={t('alert_back_title')}>
        <Typography style={styles.modalMessage}>
          {t('alert_back_message')}
        </Typography>
        <View style={styles.modalActions}>
          <Pressable
            testID="confirm-back-cancel"
            onPress={onCancel}
            style={styles.modalButton}>
            <Typography>{t('alert_cancel')}</Typography>
          </Pressable>
          <Pressable
            testID="confirm-back-yes"
            onPress={onConfirm}
            style={styles.modalButton}>
            <Typography color={colors.primary}>{t('alert_yes')}</Typography>
          </Pressable>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  modalMessage: {marginBottom: 16, textAlign: 'center'},
  modalActions: {flexDirection: 'row', justifyContent: 'space-around'},
  modalButton: {padding: 12},
});
