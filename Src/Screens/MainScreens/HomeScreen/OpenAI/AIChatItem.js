import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import StyledText from '../../../../Components/StyledText';
import {COLORS} from '../../../../Utilities/Colors';
import SVGIcon from '../../../../Components/SVGIcon';
import {textToAudioService} from '../../../../Services/ApiService';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import LoadingDots from '../../../../Components/LoadingDots';
import MediaProgressSlider from '../../../../Components/MediaProgressSlider';
import AppLogoBgWhite from '../../../../Assets/Png/app_logo_bg_white.png';
import Toast from '../../../../Components/Toast';

const AIChatItem = ({
  item,
  audioPlayerRef,
  readoutChatData,
  handlePlayLocalAudio,
  handleReadoutChat,
  handlePlayAudio,
  handleTranslate,
  handleSeeOriginal,
  translationData,
  handleStopAudio,
  onShareContent,
  progress,
  isMount,
  isEnableShare = true,
}) => {
  const token = useToken();
  const profile = useProfile();
  const [isLoadingTranslate, setisLoadingTranslate] = useState(false);
  const [translatedText, settranslatedText] = useState('');

  /**
   * Handles the response from the AI service for reading text to audio.
   * @param {string} msg - The message to be converted to audio.
   * @returns None
   */
  // const handleReadAIResponse = msg => {
  //   if (isMount) {
  //     setisLoadingTranslate(true);
  //   }
  //   const formData = new FormData();
  //   formData.append('token', token);
  //   formData.append('message', msg);
  //   formData.append('translation_type', 2);

  //   textToAudioService(formData)
  //     .then(res => {
  //       if (res.data.status === 1) {
  //         if (isMount) {
  //           setisLoadingTranslate(false);
  //           settranslatedText(res.data.translation);
  //         }
  //       } else if (res.data.status === 0) {
  //         Toast.fail(res.data.msg);
  //         if (isMount) {
  //           setisLoadingTranslate(false);
  //         }
  //       }
  //     })
  //     .catch(e => {
  //       Toast.fail(e.message);
  //       if (isMount) {
  //         setisLoadingTranslate(false);
  //       }
  //     });
  // };

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
                    if (
                      readoutChatData?.id === item.id &&
                      readoutChatData?.isPlaying
                    ) {
                      handleStopAudio();
                    } else {
                      handlePlayLocalAudio(item.audioUrl, item.id);
                    }
                  }}
                  seekUpdate={value => {
                    try {
                      audioPlayerRef?.current?.seekToPlayer(value * 1000);
                    } catch (e) {}
                  }}
                  progress={
                    readoutChatData?.id === item.id &&
                    readoutChatData?.isPlaying
                      ? progress
                      : 0
                  }
                  isPaused={
                    !(
                      readoutChatData?.id === item.id &&
                      readoutChatData?.isPlaying
                    )
                  }
                  duration={item.duration ?? 0}
                />
              </View>
              {item.isAudioLoading ? (
                <StyledText
                  style={{
                    color: COLORS.dividerColor,
                  }}>
                  Converting audio to text...
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
              {translationData.id === item.id && translationData.text
                ? translationData.text
                : item.msgQuery || item.msg}
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
            disabled={
              readoutChatData?.id === item.id && readoutChatData?.isLoading
            }
            style={styles.button}
            onPress={() => {
              if (
                readoutChatData?.id === item.id &&
                readoutChatData?.isPlaying
              ) {
                handleStopAudio();
              } else {
                if (
                  readoutChatData?.id === item.id &&
                  !readoutChatData?.isLoading &&
                  readoutChatData?.url
                ) {
                  handlePlayAudio(readoutChatData?.url);
                } else {
                  handleReadoutChat(item.msgQuery || item.msg, item.id);
                }
              }
            }}>
            {readoutChatData?.id === item.id && readoutChatData?.isLoading ? (
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
                    readoutChatData?.id === item.id &&
                    readoutChatData?.isPlaying
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
                        readoutChatData?.id === item.id &&
                        readoutChatData?.isPlaying
                          ? COLORS.secondary
                          : COLORS.white,
                    },
                  ]}>
                  {readoutChatData?.id === item.id && readoutChatData?.isPlaying
                    ? 'Stop'
                    : 'Read Out'}
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
                marginHorizontal: 10,
              }}
            />
          )}
          {isEnableShare && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.button}
              onPress={() => {
                onShareContent(item.msgQuery || item.msg);
              }}>
              <SVGIcon icon={'share'} width={18} height={18} marginRight={5} />
              <StyledText style={styles.buttonText}>Share</StyledText>
            </TouchableOpacity>
          )}

          <View
            style={{
              width: 1,
              height: '100%',
              backgroundColor: COLORS.white,
              opacity: 0.3,
              marginHorizontal: 10,
            }}
          />
          {translationData.id === item.id && translationData.isLoading ? (
            <LoadingDots size={6} bounceHeight={4} dots={3} borderRadius={3} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.button}
              onPress={() => {
                if (translationData.id === item.id && translationData.text) {
                  handleSeeOriginal();
                } else {
                  handleTranslate(item.msgQuery || item.msg, item.id);
                }
              }}>
              <SVGIcon
                icon={
                  translationData.id === item.id && translationData.text
                    ? 'translation_secondary'
                    : 'translation_white'
                }
                width={18}
                height={18}
                marginRight={5}
              />
              <StyledText style={styles.buttonText}>
                {translationData.id === item.id && translationData.text
                  ? 'Original'
                  : 'Translate'}
              </StyledText>
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
