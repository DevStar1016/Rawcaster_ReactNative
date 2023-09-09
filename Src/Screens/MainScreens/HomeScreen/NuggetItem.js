import {View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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
  const {
    isMuted,
    viewableNuggetItem,
    mediaHeight,
    isAutoPlay,
    nuggetContentController,
    handleStopAudio,
    isReadMuted,
    // isFocused,
  } = useNuggetParentActions();

  const isFocused = useIsFocused();

  const {isRepeatVideo, nugget, viewableItem, parentNuggetIndex} =
    useNuggetItemActions();

  const [paused, setpaused] = useState(true);
  const [progress, setprogress] = useState(0);
  const [duration, setduration] = useState(0);

  const videoPlayer = useRef(null);
  const [isLoadingVideo, setisLoadingVideo] = useState(false);

  const isAppForeground = useIsAppForeground();

  const shouldPauseVideo = useMemo(() => {
    // if (!viewableNuggetItem && parentNuggetIndex === 0 && isAutoPlay) {
    //   return true;
    // }
    return (
      isAppForeground &&
      viewableItem === mediaItem.media_id &&
      nugget.nugget_id === viewableNuggetItem &&
      isFocused &&
      isAutoPlay
    );
  }, [
    isAppForeground,
    viewableItem,
    viewableNuggetItem,
    mediaItem.media_id,
    isFocused,
    isAutoPlay,
    isReadMuted,
  ]);

  const shouldPauseReadAudio = useMemo(() => {
    if (!viewableNuggetItem && parentNuggetIndex === 0) {
      return true;
    }
    return (
      isAppForeground &&
      viewableItem === mediaItem.media_id &&
      nugget.nugget_id === viewableNuggetItem &&
      isFocused
    );
  }, [
    isAppForeground,
    viewableItem,
    viewableNuggetItem,
    mediaItem.media_id,
    isFocused,
  ]);

  useEffect(() => {
    setpaused(!shouldPauseVideo);
  }, [shouldPauseVideo]);

  useEffect(() => {
    if (!shouldPauseReadAudio) {
      if (nuggetContentController.current) {
        nuggetContentController.current.abort();
      }
      handleStopAudio();
    }
  }, [shouldPauseReadAudio]);

  /**
   * A callback function that seeks the video player to the specified seek time.
   * @param {number} seekTime - The time to seek to in seconds.
   * @returns None
   */
  const seekUpdate = useCallback(
    async seekTime => {
      try {
        if (videoPlayer.current) videoPlayer.current.seek(seekTime);
      } catch (error) {}
    },
    [duration],
  );

  function getNuggetItem() {
    if (mediaItem.media_type.includes('video')) {
      return (
        <VideoNugget
          videoPlayer={videoPlayer}
          paused={paused}
          setisLoadingVideo={setisLoadingVideo}
          duration={duration}
          setduration={setduration}
          progress={progress}
          setprogress={setprogress}
          url={mediaItem.path}
          index={index}
        />
      );
    } else if (mediaItem.media_type.includes('audio')) {
      return (
        <AudioNugget
          audioPlayer={videoPlayer}
          setisLoadingVideo={setisLoadingVideo}
          paused={paused}
          duration={duration}
          setduration={setduration}
          progress={progress}
          setprogress={setprogress}
          url={mediaItem.path}
          index={index}
        />
      );
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
          isLoadingVideo={isLoadingVideo}
          onPressShareType={onPressShareType}
          onPressShare={onPressShare}
          onEditNugget={onEditNugget}
          onDeleteNugget={onDeleteNugget}
          onBlockUser={onBlockUser}
          isPaused={paused}
          onPlayPauseVideo={() => {
            if (paused) {
              handleStopAudio();
            }
            setpaused(pre => !pre);
          }}
          setpaused={setpaused}
          duration={duration}
          progress={progress}
          mediaSeekUpdate={seekUpdate}
          onReportAbouseNugget={onReportAbouseNugget}
          nuggetContentController={nuggetContentController}
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
      duration,
      progress,
      isReadMuted,
    ],
  );
}

export default NuggetItem;
