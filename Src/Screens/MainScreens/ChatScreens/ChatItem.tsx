import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';

type Props = {
  item: any;
  isPreChatSame?: boolean;
  isGroup?: boolean;
};

const ChatItem = ({item, isPreChatSame, isGroup}: Props) => {
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

  return (
    <View
      style={[
        styles.mainContainer,
        {
          flexDirection: item?.user_id === 1 ? 'row' : 'row-reverse',
          marginTop: isPreChatSame ? 3 : 10,
        },
      ]}>
      {item?.user_id === 1 &&
        (isGroup && !isPreChatSame ? (
          <ProfileWithBadge
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
        <StyledText
          style={{color: item?.user_id === 1 ? COLORS.black : COLORS.white}}>
          {item?.content}
        </StyledText>
      </View>
    </View>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: 10,
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
});
