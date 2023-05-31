import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import StyledText from '../../../../Components/StyledText';
import {COLORS} from '../../../../Utilities/Colors';
import SVGIcon from '../../../../Components/SVGIcon';
import {textToAudioService} from '../../../../Services/ApiService';
import {useToken} from '../../../../Utilities/StoreData';

var isMount = true;
const AIChatItem = ({item}) => {
  const [isReadMessageLoading, setisReadMessageLoading] = useState(true);
  const token = useToken();

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function handleReadAIResponse(msg) {
    if (isMount) {
      setisReadMessageLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('message', msg);
    textToAudioService(formData)
      .then(res => {
        console.log(res.data, 'RESPONSE');
        if (res.data.status === 1) {
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {
        console.log(e, 'ERROR READ');
      })
      .finally(() => {
        if (isMount) {
          setisReadMessageLoading(false);
        }
      });
  }

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
          <StyledText style={{color: COLORS.white}}>{item.msg}</StyledText>
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
            style={styles.button}
            onPress={() => {
              handleReadAIResponse(item.msg);
            }}>
            <SVGIcon
              icon={'mic_fill_white'}
              width={18}
              height={18}
              marginRight={5}
            />
            <StyledText style={styles.buttonText}>Read Out</StyledText>
          </TouchableOpacity>
          <View
            style={{
              width: 1,
              backgroundColor: COLORS.white,
              opacity: 0.3,
              marginHorizontal: 20,
            }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={() => {}}>
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
  },

  buttonText: {
    color: COLORS.white,
  },
});
