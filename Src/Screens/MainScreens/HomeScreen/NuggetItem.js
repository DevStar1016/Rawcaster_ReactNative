import {View} from 'react-native';
import React, {useEffect, useState} from 'react';

import NuggetActionsOverlay from './NuggetActionsOverlay';
import VideoNugget from './NuggetItemTypes/VideoNugget';
import ImageNugget from './NuggetItemTypes/ImageNugget';
import {useIsAppForeground} from '../../../Utilities/StoreData';
import {useIsFocused} from '@react-navigation/native';
import AudioNugget from './NuggetItemTypes/AudioNugget';

function NuggetItem({
  index,
  viewableItem,
  viewableNuggetItem,
  mediaItem,
  onFinishPlaying,
  isOpenComments,
  isEnableTopInsetsPadding,
  nuggetId,
  headerContainerHeight,
  nugget,
  isLiked,
  onPressLike,
  setTotalComments,
  isSaved,
  onPressSave,
  textNuggetNumberOfLines,
  isMuted,
  setisOpenComments,
  setisMuted,
  mediaHeight,
  isEnableADDButton,
}) {
  const [paused, setpaused] = useState(true);
  const isFocused = useIsFocused();

  const isAppForeground = useIsAppForeground();

  useEffect(() => {
    if (
      isAppForeground &&
      viewableItem === mediaItem.media_id &&
      nuggetId === viewableNuggetItem &&
      isFocused &&
      !isOpenComments
    ) {
      setpaused(false);
    } else {
      setpaused(true);
    }
  }, [
    viewableItem,
    viewableNuggetItem,
    nuggetId,
    mediaItem,
    isAppForeground,
    isFocused,
  ]);

  const getNuggetItem = () => {
    if (mediaItem.media_type.includes('video')) {
      return (
        <VideoNugget
          mediaHeight={mediaHeight}
          paused={paused}
          isOpenComments={isOpenComments}
          isMuted={isMuted}
          onFinishPlaying={onFinishPlaying}
          url={mediaItem.path}
          index={index}
        />
      );
    } else if (mediaItem.media_type.includes('audio')) {
      return (
        <AudioNugget
          mediaHeight={mediaHeight}
          paused={paused}
          isOpenComments={isOpenComments}
          isMuted={isMuted}
          onFinishPlaying={onFinishPlaying}
          url={mediaItem.path}
          index={index}
        />
      );
    } else if (mediaItem.media_type.includes('image')) {
      return <ImageNugget url={mediaItem.path} mediaHeight={mediaHeight} />;
    } else {
      return null;
    }
  };

  return (
    <View style={{flex: 1}}>
      {getNuggetItem()}

      <NuggetActionsOverlay
        nugget={nugget}
        textNuggetNumberOfLines={textNuggetNumberOfLines}
        isEnableTopInsetsPadding={isEnableTopInsetsPadding}
        headerContainerHeight={headerContainerHeight}
        isEnableADDButton={isEnableADDButton}
        nuggetType={mediaItem.media_type}
        setisOpenComments={setisOpenComments}
        isLiked={isLiked}
        setTotalComments={setTotalComments}
        onPressLike={onPressLike}
        isSaved={isSaved}
        isPaused={paused}
        isMuted={isMuted}
        setisMuted={setisMuted}
        onPressMuteUnmute={() => {
          setisMuted(pre => !pre);
        }}
        onPlayPauseVideo={() => {
          setpaused(pre => !pre);
        }}
        onPressSave={onPressSave}
      />
    </View>
  );
}

export default NuggetItem;
