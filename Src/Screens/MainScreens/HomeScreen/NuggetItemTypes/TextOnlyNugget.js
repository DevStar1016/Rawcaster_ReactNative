import {StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import DefaultBackground from '../../../../Components/DefaultBackground';
import {useInsets, useIsAppForeground} from '../../../../Utilities/StoreData';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';
import {useIsFocused} from '@react-navigation/native';

const TextOnlyNugget = ({
  onPressShare,
  onPressShareType,
  onEditNugget,
  onDeleteNugget,
  onBlockUser,
  onReportAbouseNugget,
}) => {
  const {mediaHeight, viewableNuggetItem} = useNuggetParentActions();
  const {
    nugget,
    viewableItem,
    parentNuggetIndex,
    handleStopAudio,
    isReadMuted,
  } = useNuggetItemActions();
  const insets = useInsets();
  const isAppForeground = useIsAppForeground();
  const isFocused = useIsFocused();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;

  const shouldPauseReadAudio = useMemo(() => {
    if (!viewableNuggetItem && parentNuggetIndex === 0) {
      return true;
    }
    return (
      isAppForeground && nugget.nugget_id === viewableNuggetItem && isFocused
    );
  }, [
    isAppForeground,
    viewableItem,
    viewableNuggetItem,
    isFocused,
    isReadMuted,
  ]);

  useEffect(() => {
    console.log('text nugget stop', shouldPauseReadAudio);
    handleStopAudio();
  }, [shouldPauseReadAudio]);

  return (
    <View
      style={[
        styles.mainContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <DefaultBackground bgColor={COLORS.primaryDark} />

      <NuggetActionsOverlay
        onEditNugget={onEditNugget}
        onDeleteNugget={onDeleteNugget}
        onPressShare={onPressShare}
        onPressShareType={onPressShareType}
        onBlockUser={onBlockUser}
        onReportAbouseNugget={onReportAbouseNugget}
      />
    </View>
  );
};

export default TextOnlyNugget;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
