import {
  ActivityIndicator,
  Image,
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
import TitleDescriptionContainer from './TitleDescriptionContainer';
import SwtchesContainer from './SwtchesContainer';
import {useProfile, useSettings} from '../../../Utilities/StoreData';
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
import moment from 'moment';

const EventSettings = () => {
  const isFocused = useIsFocused();
  const settings = useSettings();
  const videoAudioPlayer = useRef(null);
  const [isVideoLoaded, setisVideoLoaded] = useState(false);
  const [isVideoLoading, setisVideoLoading] = useState(true);
  const [paused, setpaused] = useState(true);
  const [selectedEventType, setselectedEventType] = useState(
    [...EVENT_VISIBILITY_TYPE_LIST].find(
      item => item.id === parseInt(settings.event_type),
    ),
  );
  const [melody, setmelody] = useState(settings.default_melody);

  const [audioSettingsList, setaudioSettingsList] = useState([
    {
      id: 1,
      name: 'Host',
      status: parseInt(settings.host_audio) === 1,
    },
    {
      id: 2,
      name: 'Guest',
      status: parseInt(settings.participant_audio) === 1,
    },
  ]);

  const [videoSettingsList, setvideoSettingsList] = useState([
    {
      id: 1,
      name: 'Host',
      status: parseInt(settings.host_video) === 1,
    },
    {
      id: 2,
      name: 'Guest',
      status: parseInt(settings.participant_video) === 1,
    },
  ]);

  useEffect(() => {
    if (!isFocused) {
      setpaused(true);
    }
  }, [isFocused]);

  useEffect(() => {
    if (melody && melody.path && melody.type === 2) {
      createMelodyVideoThumbnail();
    }
  }, []);

  useEffect(() => {
    if (melody && melody.type === 2 && melody.thumbnail && isVideoLoaded) {
      setisVideoLoading(false);
    }
  }, [melody, isVideoLoaded]);

  async function createMelodyVideoThumbnail() {
    createThumbnail({
      url: melody.path,
      timeStamp: 10000,
    })
      .then(res => {
        setmelody(preData => ({...preData, thumbnail: res.path}));
      })
      .catch(e => {});
  }

  function getEnabledSwitchesIds(list) {
    return list.filter(item => item.status).map(item => item.id);
  }

  function getChangedStatus(list, id) {
    return list.map(item => {
      if (item.id === id) {
        return {...item, status: !item.status};
      }
      return {...item};
    });
  }

  function handleSelectMeetingHeaderImage() {
    ImageVideoPicker({height: 300, width: 500})
      .then(res => {
        console.log(res, 'IMAGEEE');
      })
      .catch(e => {});
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

  function onPressUploadMelody() {
    DocumentPicker.pick({
      type: [
        DocumentPicker.types.images,
        DocumentPicker.types.audio,
        DocumentPicker.types.video,
      ],
    })
      .then(res => {
        setmelody({
          path: res[0].uri,
          type: getFileType(res[0].type),
          title: res[0].name,
        });
        console.log(res, 'FILE');
      })
      .catch(e => {});
  }

  function getMelodyFile() {
    if (melody.type === 1) {
      return (
        <Image
          source={{uri: melody.path}}
          style={{width: '100%', height: '100%'}}
          resizeMode={'contain'}
        />
      );
    } else if (melody.type === 2 || melody.type === 3) {
      return (
        <View style={{flex: 1}}>
          <Video
            ref={videoAudioPlayer}
            source={{
              uri: melody.path,
            }}
            ignoreSilentSwitch={'ignore'}
            // style={VideoDimensions}
            style={{
              width: melody.type === 2 ? DIMENSIONS.window.width - 32 : 0,
              height: melody.type === 2 ? 178 : 0,
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
              setisVideoLoaded(true);
            }}
            // onProgress={PlayBackStatusUpdate}
            onEnd={() => {
              setpaused(true);
              videoAudioPlayer.current.seek(0);
            }}
          />

          {melody.thumbnail && paused ? (
            <Image
              source={{uri: melody.thumbnail}}
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
            isChecked
            title="Waiting Room"
            description="Allow participants to be placed in a waiting room until the host
            admits them individually"
            titleStyle={{fontSize: 15}}
          />
          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Join before host"
            description="Allow participants to join the meeting event before the host
            arrives. This will disable the waiting room feature."
            titleStyle={{fontSize: 15}}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Use sound to notify when a participant joins or exist"
            description="When enabled, host will hear a sound for each participant that
            joins the meeting."
            titleStyle={{fontSize: 15}}
          />

          <TitleDescriptionContainer
            isEnableTitleCheckButton
            isChecked
            title="Allow any participant to share their screen during meeting"
            description=" When enabled, any participant in the event can share their screen
            during meeting."
            titleStyle={{fontSize: 15}}
          />
          <SwtchesContainer
            title="Default Audio Settings"
            description="Start meeting with audio on"
            isSwitchesFlexStart={true}
            switchesList={audioSettingsList}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(audioSettingsList)}
            onChangeButtonStatus={id => {
              setaudioSettingsList(preList => {
                return getChangedStatus(preList, id);
              });
            }}
          />
          <SwtchesContainer
            title="Default Video Settings"
            description="Start meeting with video on"
            isSwitchesFlexStart={true}
            switchesList={videoSettingsList}
            onStatusSwitchesIdsList={getEnabledSwitchesIds(videoSettingsList)}
            onChangeButtonStatus={id => {
              setvideoSettingsList(preList => {
                return getChangedStatus(preList, id);
              });
            }}
          />
          <DropDownPicker
            title="Event Type"
            value={selectedEventType}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={EVENT_VISIBILITY_TYPE_LIST}
            fieldName="name"
            onSelectItem={selectedItem => {
              setselectedEventType(selectedItem);
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
                onPressUploadMelody();
              }}
            />
            {melody && melody.path && (
              <View style={[styles.imageSelectorContainer, {marginTop: 10}]}>
                {getMelodyFile()}
              </View>
            )}
          </View>
          <TitleDescriptionContainer
            title="Meeting Header Image"
            description="Choose or upload an image that depicts this event. Leave blank to
            use Rawcaster default."
          />
          <TouchableOpacity
            style={[
              styles.imageSelectorContainer,
              {borderWidth: settings.meeting_header_image ? 0 : 1},
            ]}
            activeOpacity={0.8}
            onPress={handleSelectMeetingHeaderImage}>
            {settings.meeting_header_image ? (
              <Image
                source={{uri: settings.meeting_header_image}}
                style={{height: '100%', width: '100%'}}
                resizeMode="cover"
              />
            ) : (
              <StyledText style={{color: COLORS.grey}}>
                Recommended size 500x300
              </StyledText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
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
