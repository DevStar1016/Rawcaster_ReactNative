import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import NuggetActionsOverlay from '../NuggetActionsOverlay';
import {DIMENSIONS, IS_IOS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import DefaultBackground from '../../../../Components/DefaultBackground';
import {useInsets} from '../../../../Utilities/StoreData';

const TextOnlyNugget = ({
  nuggetData,
  isSaved,
  headerContainerHeight,
  textNuggetNumberOfLines,
  onPressLike,
  setTotalComments,
  onPressSave,
  setisOpenComments,
  isEnableTopInsetsPadding,
  isEnableADDButton,
  mediaHeight,
}) => {
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;
  return (
    <View
      style={[
        styles.mainContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <DefaultBackground />

      <NuggetActionsOverlay
        nugget={nuggetData}
        isEnableTopInsetsPadding={isEnableTopInsetsPadding}
        textNuggetNumberOfLines={textNuggetNumberOfLines}
        isEnableADDButton={isEnableADDButton}
        setisOpenComments={setisOpenComments}
        headerContainerHeight={headerContainerHeight}
        setTotalComments={setTotalComments}
        // nuggetType={mediaItem.media_type}
        isLiked={nuggetData.liked}
        onPressLike={onPressLike}
        isSaved={isSaved}
        // isPaused={paused}
        // isMuted={isMuted}
        // onPressMuteUnmute={() => {
        //   setisMuted(pre => !pre);
        // }}
        // onPlayPauseVideo={() => {
        //   setpaused(pre => !pre);
        // }}
        onPressSave={onPressSave}
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
