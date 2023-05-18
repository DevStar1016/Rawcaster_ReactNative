import {TouchableOpacity, View} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import NuggetActionsOverlay from './NuggetActionsOverlay';
import VideoNugget from './NuggetItemTypes/VideoNugget';
import ImageNugget from './NuggetItemTypes/ImageNugget';
import {useIsAppForeground} from '../../../Utilities/StoreData';
import AudioNugget from './NuggetItemTypes/AudioNugget';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../Utilities/Contexts';
import {useIsFocused} from '@react-navigation/native';

function NuggetItem({
  index,
  mediaItem,
  onEditNugget,
  onDeleteNugget,
  onPressShare,
  onPressShareType,
  onBlockUser,
  onReportAbouseNugget,
}) {
  const {isMuted, viewableNuggetItem, mediaHeight, isAutoPlay} =
    useNuggetParentActions();

  const {isRepeatVideo, nugget, viewableItem, parentNuggetIndex} =
    useNuggetItemActions();

  const [paused, setpaused] = useState(true);
  const isFocused = useIsFocused();
  const videoPlayer = useRef(null);

  const isAppForeground = useIsAppForeground();

  const shouldPauseVideo = useMemo(() => {
    if (!viewableNuggetItem && parentNuggetIndex === 0 && isAutoPlay) {
      return true;
    }
    return (
      isAppForeground &&
      viewableItem === mediaItem.media_id &&
      nugget.nugget_id === viewableNuggetItem &&
      isFocused &&
      isAutoPlay &&
      !isRepeatVideo
    );
  }, [
    isAppForeground,
    viewableItem,
    viewableNuggetItem,
    // nugget.nugget_id,
    mediaItem.media_id,
    isFocused,
    isAutoPlay,
    isRepeatVideo,
  ]);

  useEffect(() => {
    setpaused(!shouldPauseVideo);
  }, [shouldPauseVideo]);

  function getNuggetItem() {
    if (mediaItem.media_type.includes('video')) {
      return (
        <VideoNugget
          videoPlayer={videoPlayer}
          paused={paused}
          url={mediaItem.path}
          index={index}
        />
      );
    } else if (mediaItem.media_type.includes('audio')) {
      return <AudioNugget paused={paused} url={mediaItem.path} index={index} />;
    } else if (mediaItem.media_type.includes('image')) {
      return <ImageNugget url={mediaItem.path} mediaHeight={mediaHeight} />;
    }
    return null;
  }

  return useMemo(
    () => (
      <View style={{flex: 1}}>
        {getNuggetItem()}

        <NuggetActionsOverlay
          nugget={nugget}
          nuggetType={mediaItem.media_type}
          onPressShareType={onPressShareType}
          onPressShare={onPressShare}
          onEditNugget={onEditNugget}
          onDeleteNugget={onDeleteNugget}
          onBlockUser={onBlockUser}
          isPaused={paused}
          onPlayPauseVideo={() => {
            setpaused(pre => !pre);
          }}
          onReportAbouseNugget={onReportAbouseNugget}
        />
      </View>
    ),
    [
      isMuted,
      viewableNuggetItem,
      paused,
      mediaHeight,
      isRepeatVideo,
      mediaItem.path,
      index,
      nugget,
    ],
  );
}

export default NuggetItem;
