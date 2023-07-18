import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import StyledText from '../../../../Components/StyledText';
import {COLORS} from '../../../../Utilities/Colors';
import SVGIcon from '../../../../Components/SVGIcon';
import {textToAudioService} from '../../../../Services/ApiService';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import LoadingDots from '../../../../Components/LoadingDots';
import MediaProgressSlider from '../../../../Components/MediaProgressSlider';
import AppLogoBgWhite from '../../../../Assets/Png/app_logo_bg_white.png';

var isMount = true;
const AIChatItem = ({
  item,
  audioPlayerRef,
  playingChatId,
  setplayingChatId,
  readMessageLoadingIdsList,
  setreadMessageLoading,
  audioList,
  setaudioUrl,
  onShareContent,
  progress,
  setprogress,
  setisDisableAudioProcess,
  isEnableShare = true,
}) => {
  const token = useToken();
  const profile = useProfile();
  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false;
      handleStopAudio();
    };
  }, []);

  function handleReadAIResponse(msg, id) {
    if (isMount) {
      setreadMessageLoading(id, true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('message', msg);
    console.log(formData, 'FORMDATAA');
    textToAudioService(formData)
      .then(res => {
        console.log(res.data, 'KL');
        if (res.data.status === 1) {
          if (isMount) {
            setaudioUrl(id, res.data.url);
            handlePlayAudio(res.data.url, id);
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            setreadMessageLoading(id, false);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setreadMessageLoading(id, false);
        }
      });
  }

  const handlePlayAudio = async (url, id) => {
    handleStopAudio();

    try {
      if (isMount && !isLoadingRead(id)) {
        setreadMessageLoading(id, true);
      }
      await audioPlayerRef.current?.startPlayer(url);

      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition / 1000) >= 0) {
          setprogress(Math.floor(e.currentPosition / 1000));
        }

        if (Math.floor(e.currentPosition) === 0) {
          if (isMount) {
            setisDisableAudioProcess(true);

            setreadMessageLoading(id, false);
            setplayingChatId(id);
          }
        } else if (e.currentPosition >= e.duration) {
          if (isMount) {
            setisDisableAudioProcess(false);
          }
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      console.log(e, 'ERROR');
      if (isMount) {
        setreadMessageLoading(id, false);
        setplayingChatId(null);
      }
    }
  };

  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
      if (isMount) {
        setprogress(0);
      }
    } catch (e) {
      console.log(e, 'ERROR STOP');
    } finally {
      if (isMount) {
        setplayingChatId(null);
        setisDisableAudioProcess(false);
      }
    }
  };

  const isLoadingRead = id => {
    return readMessageLoadingIdsList?.includes(id);
  };

  const getAudioUrl = id => {
    const tempAudioList = [...audioList];
    const tempAudio = tempAudioList.find(item => item.id === id);
    if (tempAudio) {
      return tempAudio.url;
    }
    return null;
  };

  return (
    <View>
      <View
        style={[
          styles.messageContainer,
          {alignSelf: item.isAI ? 'flex-start' : 'flex-end'},
          item.isAI
            ? {
                borderBottomStartRadius: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.30)',
              }
            : {
                borderBottomEndRadius: 0,
                backgroundColor: COLORS.primary,
              },
        ]}>
        {item.isAI && (
          <ProfileWithBadge
            defaultProfileImage={AppLogoBgWhite}
            extraMargin={0}
            padding={0}
            profileSize={35}
          />
        )}
        <View
          style={[
            {maxWidth: '80%'},
            item.isAI ? {paddingLeft: 10} : {paddingRight: 10},
          ]}>
          {item.audioUrl ? (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  maxWidth: '95%',
                }}>
                <MediaProgressSlider
                  isVisiblePlayPause
                  isVisibleStop
                  isEnableDurationFloor={false}
                  onPlayPause={() => {
                    if (item.id !== playingChatId) {
                      handlePlayAudio(item.audioUrl, item.id);
                    } else {
                      handleStopAudio();
                    }
                  }}
                  seekUpdate={value => {
                    if (item.id === playingChatId) {
                      try {
                        audioPlayerRef?.current?.seekToPlayer(value * 1000);
                      } catch (e) {}
                    }
                  }}
                  progress={item.id === playingChatId ? progress : 0}
                  isPaused={item.id !== playingChatId}
                  duration={item.duration ?? 0}
                />
              </View>
              {item.isAudioLoading ? (
                <StyledText
                  style={{
                    color: COLORS.dividerColor,
                  }}>
                  Conterting audio to text...
                </StyledText>
              ) : (
                false
              )}
              {item.audioText ? (
                <StyledText
                  style={{
                    color: COLORS.white,
                  }}>
                  {item.audioText}
                </StyledText>
              ) : (
                false
              )}
            </View>
          ) : (
            <StyledText
              style={{
                color: COLORS.white,
              }}>
              {item.msg}
            </StyledText>
          )}
          <StyledText
            style={{
              color: COLORS.white,
              fontSize: 13,
              opacity: 0.7,
              marginTop: 5,
            }}>
            {item.dateTime}
          </StyledText>
        </View>
        {!item.isAI && (
          <ProfileWithBadge
            profileImage={profile.profile_image}
            extraMargin={0}
            padding={0}
            profileSize={35}
          />
        )}
      </View>
      {item.isAI && (
        <View style={styles.itemActionButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isLoadingRead(item.id)}
            style={styles.button}
            onPress={() => {
              if (getAudioUrl(item.id)) {
                if (item.id === playingChatId) {
                  handleStopAudio();
                } else {
                  handlePlayAudio(getAudioUrl(item.id), item.id);
                }
              } else {
                handleReadAIResponse(item.msg, item.id);
              }
            }}>
            {isLoadingRead(item.id) ? (
              <View style={{flexDirection: 'row'}}>
                <LoadingDots size={6} bounceHeight={5} dots={3} />
                <StyledText
                  style={{color: COLORS.white, marginLeft: 10, fontSize: 12}}>
                  Coverting to Audio
                </StyledText>
              </View>
            ) : (
              <>
                <SVGIcon
                  icon={
                    item.id === playingChatId
                      ? 'mic_fill_secondary'
                      : 'mic_fill_white'
                  }
                  width={18}
                  height={18}
                  marginRight={5}
                />
                <StyledText
                  style={[
                    styles.buttonText,
                    {
                      color:
                        item.id === playingChatId
                          ? COLORS.secondary
                          : COLORS.white,
                    },
                  ]}>
                  {item.id === playingChatId ? 'Stop' : 'Read Out'}
                </StyledText>
              </>
            )}
          </TouchableOpacity>
          {isEnableShare && (
            <View
              style={{
                width: 1,
                height: '100%',
                backgroundColor: COLORS.white,
                opacity: 0.3,
                marginHorizontal: 20,
              }}
            />
          )}
          {isEnableShare && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.button}
              onPress={() => {
                onShareContent(item.msg);
              }}>
              <SVGIcon icon={'share'} width={18} height={18} marginRight={5} />
              <StyledText style={styles.buttonText}>Share</StyledText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default AIChatItem;

const styles = StyleSheet.create({
  messageContainer: {
    padding: 8,
    flexDirection: 'row',
    borderRadius: 10,
    maxWidth: '90%',
  },
  itemActionButtonsContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    minWidth: 40,
    justifyContent: 'center',
  },

  buttonText: {
    color: COLORS.white,
  },
});
