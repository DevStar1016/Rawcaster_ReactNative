import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {DIMENSIONS} from '../../../Utilities/Constants';
import NuggetActionsOverlay from './NuggetActionsOverlay';
import VideoNugget from './NuggetItemTypes/VideoNugget';
import ImageNugget from './NuggetItemTypes/ImageNugget';
import {
  useIsAppForeground,
  useIsGlobalLoading,
  useUserData,
} from '../../../Utilities/StoreData';
import {useIsFocused} from '@react-navigation/native';
import AudioNugget from './NuggetItemTypes/AudioNugget';

function NuggetItem({
  index,
  viewableItem,
  viewableNuggetItem,
  mediaItem,
  onFinishPlaying,
  isEnableTopInsetsPadding,
  nuggetId,
  headerContainerHeight,
  nugget,
  isLiked,
  onPressLike,
  isSaved,
  onPressSave,
  textNuggetNumberOfLines,
  isMuted,
  setisMuted,
  mediaHeight,
  isEnableADDButton,
}) {
  const [paused, setpaused] = useState(true);
  const isFocused = useIsFocused();

  // const [isMuted, setisMuted] = useState(true);

  const isAppForeground = useIsAppForeground();

  const isGlobalLoading = useIsGlobalLoading();
  // const user = useUserData();

  useEffect(() => {
    if (
      isAppForeground &&
      viewableItem === mediaItem.media_id &&
      nuggetId === viewableNuggetItem &&
      !isGlobalLoading &&
      isFocused
      // &&((user && user.acc_verify_status === 1) || !user)
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
    // user,
    isGlobalLoading,
    isAppForeground,
    isFocused,
  ]);

  const getNuggetItem = () => {
    if (mediaItem.media_type.includes('video')) {
      return (
        <VideoNugget
          mediaHeight={mediaHeight}
          paused={paused}
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
        isLiked={isLiked}
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
