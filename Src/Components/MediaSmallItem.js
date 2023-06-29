import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import moment from 'moment';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import {DIMENSIONS, IS_IOS} from '../Utilities/Constants';
import SVGIcon from './SVGIcon';
import {COLORS} from '../Utilities/Colors';
import {useProfile, useToken} from '../Utilities/StoreData';
import {uploadChatAttachmentService} from '../Services/ApiService';

const MediaSmallItem = ({
  item,
  isEnableUploadDownloadProcess = false,
  onUploadSuccess,
  onUploadFailed,
  id,
  onRemoveItem,
}) => {
  const profile = useProfile();
  const token = useToken();
  const [isUploading, setisUploading] = useState(isEnableUploadDownloadProcess);
  const [progressValue, setprogressValue] = useState(0);
  const progressRefValue = useRef(0);
  const source = useRef(null);
  const videoPlayerRef = useRef(null);
  useEffect(() => {
    if (isEnableUploadDownloadProcess) {
      const uniqueId =
        profile.user_id +
        '' +
        (id ?? '') +
        '' +
        moment.utc().format('x') +
        '' +
        Math.floor(Math.random() * 10000 + 1);
      uploadChatAttachmentAPICall(uniqueId);
    }

    return () => {
      if (isEnableUploadDownloadProcess && source.current) {
        source.current.cancel();
      }
    };
  }, []);

  const getMediaType = type => {
    if (type.includes('image')) {
      return 2;
    } else if (type.includes('video')) {
      return 4;
    } else if (type.includes('audio')) {
      return 3;
    }
    return 1;
  };

  const onUploadProgress = progressEvent => {
    setprogressValue(progressEvent.loaded / progressEvent.total);
    progressRefValue.current = progressEvent.loaded / progressEvent.total;
    console.log(progressEvent.loaded / progressEvent.total, 'PROGRESS');
    // if (progressEvent.loaded >= progressEvent.total) {

    // }
  };

  const uploadChatAttachmentAPICall = async uniqueId => {
    source.current = axios.CancelToken.source();
    let formData = new FormData();
    formData.append('token', token);
    formData.append('refid', uniqueId);
    formData.append('chatattachment', item);
    uploadChatAttachmentService(formData, {
      onUploadProgress: onUploadProgress,
      cancelToken: source.current.token,
    })
      .then(res => {
        if (res.data.status === 1) {
          onUploadSuccess(uniqueId, res.data.filepath, getMediaType(item.type));
        } else if (res.data.status === 0) {
          onUploadFailed(uniqueId, res.data.msg);
        }
      })
      .catch(e => {
        onUploadFailed(uniqueId, e.message);
      })
      .finally(() => {
        setisUploading(false);
        setprogressValue(0);
        progressRefValue.current = 0;
      });
  };

  function getMediaItem() {
    if (item.type.includes('video')) {
      return (
        <Video
          ref={videoPlayerRef}
          resizeMode="cover"
          posterResizeMode="cover"
          paused={true}
          source={{uri: item.uri}}
          style={{height: '100%', width: '100%', borderRadius: 10}}
          onLoad={() => {
            if (videoPlayerRef.current) {
              videoPlayerRef.current.seek(0);
            }
          }}
        />
      );
    } else if (item.type.includes('audio')) {
      return (
        <View style={styles.audioBackgroundContainer}>
          <SVGIcon icon="logo_R" width={'80%'} height={'80%'} />
        </View>
      );
    }

    return (
      <Image
        style={{height: '100%', width: '100%'}}
        source={{uri: item.uri}}
        borderRadius={10}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: (DIMENSIONS.screen.width - 42) / 3,
        height: (DIMENSIONS.screen.width - 42) / 3,
        borderRadius: 5,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {getMediaItem()}

      {isUploading ? (
        <View style={styles.itemActionButtonsContainer}>
          <Progress.Circle
            size={30}
            thickness={!isUploading ? 0 : 2}
            borderWidth={0}
            color={COLORS.white}
            progress={progressValue}
            fill={COLORS.transparent}
            // indeterminate={progressValue === 0}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.itemActionButtonsContainer}
          activeOpacity={1}>
          {(item.type.includes('video') || item.type.includes('audio')) && (
            <View style={styles.playIconContainer}>
              <SVGIcon
                icon="play_white"
                height={10}
                width={10}
                marginLeft={3}
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.itemRemoveIconContainer}
            activeOpacity={0.7}
            onPress={onRemoveItem}>
            <SVGIcon icon="close_white" height={10} width={10} marginLeft={0} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MediaSmallItem;

const styles = StyleSheet.create({
  audioBackgroundContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10,
  },
  itemActionButtonsContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconContainer: {
    height: 25,
    width: 25,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
  itemRemoveIconContainer: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 22,
    width: 22,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
});
