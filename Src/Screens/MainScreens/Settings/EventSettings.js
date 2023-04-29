import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import DocumentPicker from 'react-native-document-picker';
import {COLORS} from '../../../Utilities/Colors';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import TitleDescriptionContainer from '../../../Components/TitleDescriptionContainer';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import {useProfile, useSettings, useToken} from '../../../Utilities/StoreData';
import DropDownPicker from '../../../Components/DropDownPicker';
import {
  DIMENSIONS,
  EVENT_VISIBILITY_TYPE_LIST,
} from '../../../Utilities/Constants';
import {FONTS} from '../../../Utilities/Fonts';
import SubmitButton from '../../../Components/SubmitButton';
import StyledText from '../../../Components/StyledText';
import {ImageVideoPicker} from '../../../Utilities/ImageVideoPicker';
import SVGIcon from '../../../Components/SVGIcon';
import {useIsFocused} from '@react-navigation/native';
import {createThumbnail} from 'react-native-create-thumbnail';
import {updateUserSettingsService} from '../../../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setSettings} from '../../../Store/Slices/AuthSlice';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import EventImagePicker from '../EventsAndTalkshowsCommon/EventImagePicker';

var isMount = true;
const EventSettings = () => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const settings = useSettings();
  const token = useToken();
  const videoAudioPlayer = useRef(null);
  const [isUpdating, setisUpdating] = useState(false);
  const [settingsData, setsettingsData] = useState({
    waiting_room: parseInt(settings.waiting_room),
    join_before_host: parseInt(settings.join_before_host),
    participant_join_sound: parseInt(settings.participant_join_sound),
    screen_share_status: parseInt(settings.screen_share_status),
    default_melody: settings.default_melody,
    meeting_header_image: {uri: settings.meeting_header_image},
    live_event_banner: {uri: settings.live_event_banner},
    talkshow_event_banner: {uri: settings.talkshow_event_banner},
    host_audio: parseInt(settings.host_audio),
    participant_audio: parseInt(settings.participant_audio),
    host_video: parseInt(settings.host_video),
    participant_video: parseInt(settings.participant_video),
    event_type: parseInt(settings.event_type),
  });
  const [isVideoLoaded, setisVideoLoaded] = useState(false);
  const [isVideoLoading, setisVideoLoading] = useState(true);
  const [paused, setpaused] = useState(true);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      if (isMount) {
        setpaused(true);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (
      settingsData.default_melody &&
      settingsData.default_melody.path &&
      settingsData.default_melody.type === 2
    ) {
      createMelodyVideoThumbnail();
    }
  }, [settingsData.default_melody.path]);

  useEffect(() => {
    if (
      settingsData.default_melody &&
      settingsData.default_melody.type === 2 &&
      settingsData.default_melody.thumbnail &&
      isVideoLoaded
    ) {
      if (isMount) {
        setisVideoLoading(false);
      }
    }
  }, [settingsData.default_melody, isVideoLoaded]);

  function updateUsersSettingsAPICall(
    keyText,
    valueText,
    reduxData = undefined,
  ) {
    if (isMount) {
      setisUpdating(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append(keyText, valueText);
    console.log(formData, valueText, 'FORMDATA');

    updateUserSettingsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(
            setSettings({...settings, [keyText]: reduxData ?? valueText}),
          );
          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          setsettingsData(preData => {
            return {...preData, [keyText]: settings[keyText]};
          });
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        console.log(e.response.data);
        setsettingsData(preData => {
          return {...preData, [keyText]: settings[keyText]};
        });
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisUpdating(false);
        }
      });
  }

  function getAudioVideoSettingsList(type = 1) {
    //1 - audio , 2 - video
    return [
      {
        id: 1,
        name: 'Host',
        status: settingsData[type === 1 ? 'host_audio' : 'host_video'] === 1,
      },
      {
        id: 2,
        name: 'Guest',
        status:
          settingsData[
            type === 1 ? 'participant_audio' : 'participant_video'
          ] === 1,
      },
    ];
  }

  function onChangeCheckStatus(keyName) {
    setsettingsData(preData => {
      let tempData = {...preData};
      const changedStatus = Boolean(tempData[keyName]) ? 0 : 1;
      updateUsersSettingsAPICall(keyName, changedStatus);
      tempData[keyName] = changedStatus;
      return {...tempData};
    });
  }

  async function createMelodyVideoThumbnail() {
    createThumbnail({
      url: settingsData.default_melody.path,
      timeStamp: 10000,
    })
      .then(res => {
        if (isMount) {
          setsettingsData(preData => {
            let tempMelody = {...preData.default_melody, thumbnail: res.path};
            return {...preData, default_melody: tempMelody};
          });
        }
      })
      .catch(e => {});
  }

  function getEnabledSwitchesIds(list) {
    return list.filter(item => item.status).map(item => item.id);
  }

  function handleSelectMeetingHeaderImage(selectedImageData, fieldName) {
    if (isMount) {
      setsettingsData(preData => {
        updateUsersSettingsAPICall(
          fieldName,
          JSON.stringify(selectedImageData),
          selectedImageData,
        );
        return {
          ...preData,
          [fieldName]: selectedImageData,
        };
      });
    }
  }

  function getFileType(mimeType) {
    if (mimeType.includes('image')) {
      return 1;
    } else if (mimeType.includes('video')) {
      return 2;
    } else if (mimeType.includes('audio')) {
      return 3;
    }
    return 0;
  }

  function handleUploadMelody() {
    DocumentPicker.pick({
      type: [
        DocumentPicker.types.images,
        DocumentPicker.types.audio,
        DocumentPicker.types.video,
      ],
    })
      .then(res => {
        const isVideo = getFileType(res[0].type) === 2;
        const isSamePath =
          settingsData.default_melody &&
          settingsData.default_melody.path.includes(res[0].uri);
        if (isVideo && !isSamePath) {
          if (isMount) {
            setisVideoLoading(true);
          }
        }
        if (!isSamePath) {
          const tempMelody = {
            path: res[0].uri,
            type: getFileType(res[0].type),
            title: res[0].name,
          };
          if (isMount) {
            setsettingsData(preData => {
              return {...preData, default_melody: tempMelody};
            });
          }
          updateUsersSettingsAPICall(
            'default_melody',
            JSON.stringify({
              uri: res[0].uri,
              type: res[0].type,
              name: res[0].name,
            }),
            tempMelody,
          );
        }
      })
      .catch(e => {
        if (!e.message.includes('canceled')) {
          Toast.fail(e.message);
        }
      });
  }

  function getEventTypeData() {
    return [...EVENT_VISIBILITY_TYPE_LIST].find(
      item => item.id === settingsData.event_type,
    );
  }

  function getMelodyFile() {
    if (settingsData.default_melody.type === 1) {
      return (
        <Image
          source={{uri: settingsData.default_melody.path}}
          style={{width: '100%', height: '100%'}}
          resizeMode={'contain'}
        />
      );
    } else if (
      settingsData.default_melody.type === 2 ||
      settingsData.default_melody.type === 3
    ) {
      return (
        <View style={{flex: 1}}>
          <Video
            ref={videoAudioPlayer}
            source={{
              uri: settingsData.default_melody.path,
            }}
            ignoreSilentSwitch={'ignore'}
            // style={VideoDimensions}
            style={{
              width:
                settingsData.default_melody.type === 2
                  ? DIMENSIONS.window.width - 32
                  : 0,
              height: settingsData.default_melody.type === 2 ? 178 : 0,
            }}
            resizeMode="contain"
            onError={() => {}}
            playInBackground={false}
            playWhenInactive={false}
            progressUpdateInterval={100}
            useTextureView={true}
            paused={paused}
            muted={false}
            repeat={false}
            onBuffer={() => {}}
            onLoad={() => {
              if (isMount) {
                setisVideoLoaded(true);
              }
            }}
            // onProgress={PlayBackStatusUpdate}
            onEnd={() => {
              if (isMount) {
                setpaused(true);
              }
              videoAudioPlayer.current.seek(0);
            }}
          />

          {settingsData.default_melody.thumbnail && paused ? (
            <Image
              source={{uri: settingsData.default_melody.thumbnail}}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              resizeMode="contain"
            />
          ) : (
            false
          )}

          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isVideoLoading ? (
              <>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <StyledText>Loading Melody</StyledText>
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setpaused(pre => !pre);
                }}>
                {paused && (
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.transparentDimColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <SVGIcon
                      icon="play_white"
                      height={18}
                      width={18}
                      marginLeft={5}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Event Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 10}}
          style={{flex: 1}}
          bounces={false}>
          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked={Boolean(settingsData.waiting_room)}
            title="Waiting Room"
            description="Allow participants to be placed in a waiting room until the host
            admits them individually"
            titleStyle={{fontSize: 15}}
            onPressTitleCheck={() => {
              onChangeCheckStatus('waiting_room');
            }}
          />
          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked={Boolean(settingsData.join_before_host)}
            title="Join before host"
            description="Allow participants to join the meeting event before the host
            arrives. This will disable the waiting room feature."
            titleStyle={{fontSize: 15}}
            onPressTitleCheck={() => {
              onChangeCheckStatus('join_before_host');
            }}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked={Boolean(settingsData.participant_join_sound)}
            title="Use sound to notify when a participant joins or exist"
            description="When enabled, host will hear a sound for each participant that
            joins the meeting."
            titleStyle={{fontSize: 15}}
            onPressTitleCheck={() => {
              onChangeCheckStatus('participant_join_sound');
            }}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked={Boolean(settingsData.screen_share_status)}
            title="Allow any participant to share their screen during meeting"
            description=" When enabled, any participant in the event can share their screen
            during meeting."
            titleStyle={{fontSize: 15}}
            onPressTitleCheck={() => {
              onChangeCheckStatus('screen_share_status');
            }}
          />
          <SwtchesContainer
            title="Default Audio Settings"
            description="Start meeting with audio on"
            isSwitchesFlexStart={true}
            switchesList={getAudioVideoSettingsList(1)}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(
              getAudioVideoSettingsList(1),
            )}
            onChangeButtonStatus={id => {
              if (isMount) {
                setsettingsData(preData => {
                  const keyName = id === 1 ? 'host_audio' : 'participant_audio';
                  console.log(keyName, 'KLI');
                  const changedStatus = Boolean(settingsData[keyName]) ? 0 : 1;
                  updateUsersSettingsAPICall(keyName, changedStatus);
                  return {
                    ...preData,
                    [keyName]: changedStatus,
                  };
                });
              }
            }}
          />
          <SwtchesContainer
            title="Default Video Settings"
            description="Start meeting with video on"
            isSwitchesFlexStart={true}
            switchesList={getAudioVideoSettingsList(2)}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(
              getAudioVideoSettingsList(2),
            )}
            onChangeButtonStatus={id => {
              if (isMount) {
                console.log(id, 'ID');
                setsettingsData(preData => {
                  const keyName = id === 1 ? 'host_video' : 'participant_video';
                  const changedStatus = Boolean(settingsData[keyName]) ? 0 : 1;
                  updateUsersSettingsAPICall(keyName, changedStatus);
                  return {
                    ...preData,
                    [keyName]: changedStatus,
                  };
                });
              }
            }}
          />
          <DropDownPicker
            title="Event Type"
            value={getEventTypeData()}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={EVENT_VISIBILITY_TYPE_LIST}
            fieldName="name"
            onSelectItem={selectedItem => {
              if (isMount) {
                setsettingsData(preData => {
                  updateUsersSettingsAPICall('event_type', selectedItem.id);
                  return {
                    ...preData,
                    event_type: selectedItem.id,
                  };
                });
              }
            }}
          />
          <TitleDescriptionContainer
            title="Melody"
            description="Choose or upload an audio sound or video or image that
          participants in waiting room will listen to while they wait for
          host to admit them to the meeting."
          />
          <View style={{alignItems: 'flex-start', paddingBottom: 10}}>
            <SubmitButton
              buttonText="UPLOAD MELODY"
              bgColor={COLORS.white}
              borderColor={COLORS.black}
              buttonTextStyle={{fontSize: 13, paddingVertical: 0}}
              paddingVertical={5}
              marginTop={0}
              paddingHorizontal={30}
              borderWidth={1}
              textColor={COLORS.black}
              onPress={() => {
                handleUploadMelody();
              }}
            />
            {settingsData.default_melody &&
              settingsData.default_melody.path && (
                <View style={[styles.imageSelectorContainer, {marginTop: 10}]}>
                  {getMelodyFile()}
                </View>
              )}
          </View>

          <EventImagePicker
            title="Meeting Header Image"
            description="Choose or upload an image that depicts this event. Leave blank to
           use Rawcaster default."
            selectedImage={settingsData.meeting_header_image}
            setselectedImage={imageData => {
              handleSelectMeetingHeaderImage(imageData, 'meeting_header_image');
            }}
          />
          <EventImagePicker
            title="Live Event Banner"
            description="Choose or upload an image that depicts this event. Leave blank to
           use Rawcaster default."
            selectedImage={settingsData.live_event_banner}
            settingsImageField={'live_event_banner'}
            setselectedImage={imageData => {
              handleSelectMeetingHeaderImage(imageData, 'live_event_banner');
            }}
            titleDescriptionProps={{containerStyle: {marginTop: 10}}}
          />
          <EventImagePicker
            title="Talkshow Event Banner"
            description="Choose or upload an image that depicts this event. Leave blank to
           use Rawcaster default."
            selectedImage={settingsData.talkshow_event_banner}
            settingsImageField={'talkshow_event_banner'}
            setselectedImage={imageData => {
              handleSelectMeetingHeaderImage(
                imageData,
                'talkshow_event_banner',
              );
            }}
            titleDescriptionProps={{containerStyle: {marginTop: 10}}}
          />
          {/* <TouchableOpacity
            style={[
              styles.imageSelectorContainer,
              {borderWidth: settingsData.meeting_header_image ? 0 : 1},
            ]}
            activeOpacity={0.8}
            onPress={handleSelectMeetingHeaderImage}>
            {settingsData.meeting_header_image ? (
              <Image
                source={{uri: settingsData.meeting_header_image}}
                style={{height: '100%', width: '100%'}}
                resizeMode="cover"
              />
            ) : (
              <StyledText style={{color: COLORS.grey}}>
                Recommended size 500x300
              </StyledText>
            )}
          </TouchableOpacity> */}
        </ScrollView>
      </View>
      <Modal visible={isUpdating} transparent>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Settings Updating'}
        />
      </Modal>
    </View>
  );
};

export default EventSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
  },
  imageSelectorContainer: {
    height: 180,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.grey,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
