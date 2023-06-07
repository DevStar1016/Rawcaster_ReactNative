import {TouchableOpacity, View} from 'react-native';
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
import {groupFunctionalitySocket} from '../../../Services/Socket/SocketRequests';

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

  const {
    isRepeatVideo,
    nugget,
    viewableItem,
    parentNuggetIndex,
    handleStopAudio,
    isReadMuted,
  } = useNuggetItemActions();

  const [paused, setpaused] = useState(true);
  const [progress, setprogress] = useState(0);
  const [duration, setduration] = useState(0);
  const isFocused = useIsFocused();

  const videoPlayer = useRef(null);

  const [isLoadingVideo, setisLoadingVideo] = useState(false);

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
      isAutoPlay
    );
  }, [
    isAppForeground,
    viewableItem,
    viewableNuggetItem,
    // nugget.nugget_id,
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
    // nugget.nugget_id,
    mediaItem.media_id,
    isFocused,
  ]);

  useEffect(() => {
    setpaused(!shouldPauseVideo);
  }, [shouldPauseVideo]);

  useEffect(() => {
    handleStopAudio();
  }, [shouldPauseReadAudio]);

  const seekUpdate = useCallback(
    async seekTime => {
      try {
        if (videoPlayer.current)
          videoPlayer.current.seek((seekTime * duration) / 100 / 1000);
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
