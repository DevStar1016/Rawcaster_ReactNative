import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {FONTS} from '../../../Utilities/Fonts';
import MediaPreview, {
  PreviewMediaData,
} from '../../../Modals/CameraModals/MediaPreview';
import SVGIcon from '../../../Components/SVGIcon';
import {Slider} from '@miblanchard/react-native-slider';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
//@ts-ignore
import Video from 'react-native-video';
import {IS_IOS} from '../../../Utilities/Constants';

type Props = {
  item: any;
  isPreChatSame?: boolean;
  isGroup?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  isDisableOtherClickables?: boolean;
};

type PreviewModalData = {
  isOpen: boolean;
  data: PreviewMediaData;
};

const ChatItem = ({
  item,
  isPreChatSame,
  isGroup,
  isSelected,
  isDisableOtherClickables = false,
  onPress,
  onLongPress,
}: Props) => {
  const [previewData, setpreviewData] = useState<PreviewModalData>({
    isOpen: false,
    data: {
      uri: '',
      mediaType: '',
    },
  });
  const [isPaused, setisPaused] = useState(false);
  const [isPlaying, setisPlaying] = useState(false);
  const audioPlayerRef = useRef(new AudioRecorderPlayer());
  const videoPlayerRef = useRef<any>(null);

  const DummyView = () => {
    return (
      <View
        style={[
          styles.dummyViewContainer,
          item?.user_id === 1 ? {marginRight: 5} : {marginLeft: 5},
        ]}
      />
    );
  };

  const handlePlayAudio = async (url: any) => {
    handleStopAudio();
    try {
      setisPaused(false);
      setisPlaying(true);
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition) === 0) {
          setisPaused(true);
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      setisPlaying(false);
    }
  };

  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      setisPaused(false);
      setisPlaying(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        style={[
          styles.mainContainer,
          {
            flexDirection: item?.user_id === 1 ? 'row' : 'row-reverse',
            marginTop: isPreChatSame ? 3 : 10,
          },
          isSelected && {backgroundColor: COLORS.primaryDark},
        ]}>
        {item?.user_id === 1 &&
          (isGroup && !isPreChatSame ? (
            <ProfileWithBadge
              profileImage={item?.profile_img}
              profileSize={22}
              extraMargin={0}
              padding={0}
              containerStyle={
                item?.user_id === 1 ? {marginRight: 5} : {marginLeft: 5}
              }
            />
          ) : (
            <DummyView />
          ))}
        <View
          style={[
            styles.chatMessageContainer,
            !isPreChatSame && item?.user_id === 1 && {borderTopStartRadius: 0},
            !isPreChatSame && item?.user_id === 2 && {borderTopEndRadius: 0},
            {
              backgroundColor:
                item?.user_id === 1 ? COLORS.lightGrey : COLORS.primaryLight,
            },
          ]}>
          {item.forwarded && (
            <View style={styles.forwardTextContainer}>
              <SVGIcon
                icon="share"
                height={15}
                width={15}
                marginRight={5}
                opacity={0.7}
              />
              <StyledText
                style={[
                  styles.forwardText,
                  {color: item?.user_id === 1 ? COLORS.black : COLORS.white},
                ]}>
                Forwarded
              </StyledText>
            </View>
          )}
          {item?.user_id === 1 && isGroup && (
            <StyledText style={styles.userNameText}>{item.name}</StyledText>
          )}

          {item.document_url && (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isDisableOtherClickables}
              style={{flexDirection: 'row'}}>
              <View
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    item?.user_id === 1 ? COLORS.primary : COLORS.lightGrey,
                  marginRight: 10,
                }}>
                <SVGIcon
                  icon={
                    item?.user_id === 1
                      ? 'document_fill_white'
                      : 'document_fill_primary'
                  }
                  height={20}
                  width={20}
                />
              </View>
              <View>
                <View style={{maxWidth: '90%', minWidth: '60%'}}>
                  <StyledText
                    normalTextModeTextProps={{
                      numberOfLines: 2,
                      ellipsizeMode: 'tail',
                    }}
                    style={{
                      color: item?.user_id === 1 ? COLORS.black : COLORS.white,
                      fontFamily: FONTS.DMSans.medium,
                    }}>
                    {item.document_name}
                  </StyledText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <StyledText
                    style={{
                      color: item?.user_id === 1 ? COLORS.black : COLORS.white,
                      fontFamily: FONTS.DMSans.medium,
                      fontSize: 12,
                    }}>
                    {item.document_size}
                  </StyledText>
                  <View
                    style={[
                      styles.dotContainer,
                      {
                        backgroundColor:
                          item?.user_id === 1 ? COLORS.black : COLORS.white,
                      },
                    ]}
                  />
                  <StyledText
                    style={{
                      color: item?.user_id === 1 ? COLORS.black : COLORS.white,
                      fontFamily: FONTS.DMSans.medium,
                      fontSize: 12,
                    }}>
                    {item.document_type}
                  </StyledText>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {item.audio_url && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item?.user_id === 2 && (
                <ProfileWithBadge
                  profileImage={item?.profile_img}
                  profileSize={50}
                  extraMargin={0}
                  padding={0}
                  containerStyle={{marginRight: 5}}
                />
              )}
              <View
                style={{
                  flexDirection: 'row',
                  // backgroundColor: 'red',
                  width: '75%',
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.primary,
                    marginRight: 5,
                  }}>
                  <SVGIcon icon="play_fill_white" height={15} marginLeft={3} />
                </TouchableOpacity>
                <View style={{width: '80%'}}>
                  <Slider
                    containerStyle={{
                      height: 30,
                      width: '100%',
                    }}
                    thumbTintColor={COLORS.white}
                    maximumTrackTintColor={COLORS.dimColor}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackStyle={{opacity: 0.6}}
                    minimumValue={0}
                    maximumValue={100}
                    // value={progress}
                    // onSlidingComplete={data => seekUpdate(data[0])}
                    thumbStyle={{
                      height: 15,
                      width: 15,
                      borderRadius: 9,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      // marginLeft: 5,
                      width: '100%',
                    }}>
                    <StyledText
                      style={{
                        color:
                          item?.user_id === 1 ? COLORS.black : COLORS.white,
                        fontSize: 12,
                      }}>
                      {item.audio_duration}
                    </StyledText>
                    <StyledText
                      style={[
                        styles.timeText,
                        {
                          color:
                            item?.user_id === 1 ? COLORS.black : COLORS.white,
                        },
                      ]}>
                      03:05 pm
                    </StyledText>
                  </View>
                </View>
              </View>
              {item?.user_id === 1 && (
                <ProfileWithBadge
                  profileImage={item?.profile_img}
                  profileSize={50}
                  extraMargin={0}
                  padding={0}
                  containerStyle={{marginLeft: 5}}
                />
              )}
            </View>
          )}

          {item?.image && (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isDisableOtherClickables}
              style={{height: 150, minWidth: '80%', marginVertical: 5}}
              onPress={() => {
                setpreviewData({
                  data: {
                    mediaType: 'image',
                    uri: item?.image,
                  },
                  isOpen: true,
                });
              }}>
              <Image
                source={{uri: item.image}}
                borderRadius={10}
                style={{height: '100%', width: '100%'}}
              />
            </TouchableOpacity>
          )}

          {item?.video_url && (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isDisableOtherClickables}
              style={{height: 150, minWidth: '80%', marginVertical: 5}}
              onPress={() => {
                setpreviewData({
                  data: {
                    mediaType: 'video',
                    uri: item?.video_url,
                  },
                  isOpen: true,
                });
              }}>
              {/* {IS_IOS ? ( */}
              <Video
                ref={videoPlayerRef}
                resizeMode="cover"
                posterResizeMode="cover"
                paused={true}
                source={{uri: item.video_url}}
                style={{height: '100%', width: '100%', borderRadius: 10}}
                onLoad={() => {
                  if (videoPlayerRef.current) {
                    videoPlayerRef.current.seek(0);
                  } // this will set first frame of video as thumbnail
                }}
              />
              {/* ) : (
                <Image
                  style={{height: '100%', width: '100%'}}
                  source={{uri: item.video_url}}
                  borderRadius={10}
                  resizeMode="cover"
                />
              )} */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.primary,
                    marginRight: 5,
                  }}>
                  <SVGIcon icon="play_fill_white" height={15} marginLeft={3} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          {item?.content && (
            <StyledText
              style={{
                color: item?.user_id === 1 ? COLORS.black : COLORS.white,
              }}>
              {item?.content}
            </StyledText>
          )}
          {!item.audio_url && (
            <View style={styles.timeContainer}>
              <StyledText
                style={[
                  styles.timeText,
                  {color: item?.user_id === 1 ? COLORS.black : COLORS.white},
                ]}>
                03:05 pm
              </StyledText>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Modal
        visible={previewData.isOpen}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {
          setpreviewData({
            isOpen: false,
            data: {
              uri: '',
              mediaType: '',
            },
          });
        }}>
        <MediaPreview
          setModal={() => {
            setpreviewData({
              isOpen: false,
              data: {
                uri: '',
                mediaType: '',
              },
            });
          }}
          isEnableDone={false}
          isEnableEdit={false}
          data={previewData.data}
        />
      </Modal>
    </>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
  },
  chatMessageContainer: {
    padding: 6,
    borderRadius: 10,
    maxWidth: '75%',
  },
  dummyViewContainer: {
    height: 22,
    width: 22,
  },
  forwardTextContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 3,
  },
  forwardText: {
    fontSize: 12,
    opacity: 0.7,
  },
  userNameText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  dotContainer: {
    height: 4,
    width: 4,
    borderRadius: 4 / 2,
    backgroundColor: COLORS.white,
    marginHorizontal: 6,
  },
});
