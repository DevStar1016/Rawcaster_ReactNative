import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DefaultBackground from '../../../Components/DefaultBackground';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import ReplaceStatusBar from '../../../Components/ReplaceStatusBar';
import EncryptedMessageContainer from './EncryptedMessageContainer';
import {IS_IOS} from '../../../Utilities/Constants';
import {useInsets} from '../../../Utilities/StoreData';
import TextBox from '../../../Components/TextBox';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ChatTextInput from './ChatTextInput';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {getSlicedText} from '../../../Utilities/Methods';

var isMount = true;
const UserChat = ({route}) => {
  const insets = useInsets();
  const {userData} = route.params ?? {};
  const [headerHeight, setheaderHeight] = useState(20);
  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
      isMount = false;
    };
  }, []);
  return (
    <HOCView
      isEnableDefaultBackground
      isEnableRLogo={false}
      paddingHorizontal={0}
      headerType="header_with_back"
      onLayoutHeaderHeight={setheaderHeight}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: getSlicedText(userData?.display_name),
        isEnableProfileImage: true,
        titlePaddingHorizontal: 5,
        profileImageProps: {
          profileSize: 30,
          extraMargin: 0,
          padding: 0,
        },

        profileContainer: {marginVertical: 2, marginLeft: 5},
      }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={!IS_IOS ? 0 : headerHeight}
        behavior={IS_IOS ? 'padding' : null}
        style={{flex: 1}}>
        <EncryptedMessageContainer />
        <View style={styles.chatListContainer}>
          <FlatList data={[]} />
        </View>

        <ChatTextInput />
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
});
