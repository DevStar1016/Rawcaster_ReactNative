import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import StyledText from '../../../../Components/StyledText';
import {COLORS} from '../../../../Utilities/Colors';
import SVGIcon from '../../../../Components/SVGIcon';
import {textToAudioService} from '../../../../Services/ApiService';
import {useToken} from '../../../../Utilities/StoreData';
import LoadingDots from '../../../../Components/LoadingDots';

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
}) => {
  const token = useToken();

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
    textToAudioService(formData)
      .then(res => {
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
        if (Math.floor(e.currentPosition) === 0) {
          if (isMount) {
            setreadMessageLoading(id, false);
            setplayingChatId(id);
          }
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
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
    } catch (e) {
    } finally {
      if (isMount) {
        setplayingChatId(null);
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
          <ProfileWithBadge extraMargin={0} padding={0} profileSize={35} />
        )}
        <View
          style={[
            {maxWidth: '80%'},
            item.isAI ? {paddingLeft: 10} : {paddingRight: 10},
          ]}>
          <StyledText
            style={{
              color: COLORS.white,
            }}>
            {item.msg}
          </StyledText>
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
          <ProfileWithBadge extraMargin={0} padding={0} profileSize={35} />
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
              <LoadingDots size={6} bounceHeight={5} dots={3} />
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
          <View
            style={{
              width: 1,
              height: '100%',
              backgroundColor: COLORS.white,
              opacity: 0.3,
              marginHorizontal: 20,
            }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={() => {
              onShareContent(item.msg);
            }}>
            <SVGIcon icon={'share'} width={18} height={18} marginRight={5} />
            <StyledText style={styles.buttonText}>Share</StyledText>
          </TouchableOpacity>
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
