import {FlatList, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import EncryptedMessageContainer from './EncryptedMessageContainer';
import {IS_IOS} from '../../../Utilities/Constants';
import {useInsets, useProfile} from '../../../Utilities/StoreData';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ChatTextInput from './ChatTextInput';
import {getSlicedText} from '../../../Utilities/Methods';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {useNavigation} from '@react-navigation/native';

var isMount = true;
const UserChat = ({route}) => {
  const insets = useInsets();
  const navigation = useNavigation();
  const {userData} = route.params ?? {};
  const [headerHeight, setheaderHeight] = useState(20);
  const profile = useProfile();
  const [chatList, setchatList] = useState([
    {
      date: '2023-06-23',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Eppudiiii',
      user_id: 2,
    },

    {
      date: '2023-06-23',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Nee Thani Oruvan na Naan Evano Oruvan da',
      user_id: 2,
    },

    {
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: "It's me Thani Oruvan",
      user_id: 1,
    },

    {
      date: '2023-06-22',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Hiii',
      user_id: 2,
    },

    {
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Hiii',
      user_id: 1,
    },
  ]);

  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
      isMount = false;
    };
  }, []);

  const renderChatItem = ({item}) => {
    return (
      <View
        style={{
          alignItems: item.user_id === 1 ? 'flex-start' : 'flex-end',
        }}>
        <View
          style={[
            {padding: 5, borderRadius: 10},
            item.user_id === 1
              ? {borderTopStartRadius: 0, backgroundColor: COLORS.lightGrey}
              : {borderTopEndRadius: 0, backgroundColor: COLORS.primaryLight},
          ]}>
          <StyledText
            style={{color: item.user_id === 1 ? COLORS.black : COLORS.white}}>
            {item.content}
          </StyledText>
        </View>
      </View>
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <HOCView
      isEnableDefaultBackground
      isEnableRLogo={false}
      paddingHorizontal={0}
      headerType="header_with_back"
      onLayoutHeaderHeight={setheaderHeight}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: getSlicedText(userData?.display_name, 25),
        isEnableProfileImage: true,
        titlePaddingHorizontal: 5,
        profileImageProps: {
          profileSize: 30,
          extraMargin: 0,
          padding: 0,
        },
        isEnableBackButton: false,
        isEnableRightIcon: true,
        rightIcon: 'close_white',
        onPressRightIcon: handleGoBack,
        profileContainer: {marginVertical: 2, marginLeft: 5},
      }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={!IS_IOS ? 0 : headerHeight}
        behavior={IS_IOS ? 'padding' : null}
        style={{flex: 1}}>
        <EncryptedMessageContainer />
        <View style={styles.chatListContainer}>
          <FlatList
            data={chatList}
            inverted
            renderItem={renderChatItem}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
            style={{flexGrow: 0}}
            showsVerticalScrollIndicator={false}
            bounces={false}
          />
        </View>

        <ChatTextInput onPressSend={() => {}} />
      </KeyboardAvoidingView>
    </HOCView>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
  },
  leftContainer: {
    flexDirection: 'row',
  },
  chatListContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
  },
});
