import {StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {useInsets, useIsAppForeground} from '../../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import DefaultBackground from '../../../../Components/DefaultBackground';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';
import {useIsFocused} from '@react-navigation/native';

const PollNugget = ({
  onDeleteNugget,
  onEditNugget,
  onPressShare,
  onPressShareType,
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
    handleStopAudio();
  }, [shouldPauseReadAudio]);

  return (
    <View
      style={[
        styles.mainContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <DefaultBackground />
      <NuggetActionsOverlay
        onPressShareType={onPressShareType}
        onPressShare={onPressShare}
        onEditNugget={onEditNugget}
        onDeleteNugget={onDeleteNugget}
        onBlockUser={onBlockUser}
        onReportAbouseNugget={onReportAbouseNugget}
      />
    </View>
  );
};

export default PollNugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'red',
  },
});
