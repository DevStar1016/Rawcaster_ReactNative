import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useInsets} from '../../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import DefaultBackground from '../../../../Components/DefaultBackground';
import NuggetActionsOverlay from '../NuggetActionsOverlay';

const PollNugget = ({
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
        setTotalComments={setTotalComments}
        headerContainerHeight={headerContainerHeight}
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

export default PollNugget;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'red',
  },
});
