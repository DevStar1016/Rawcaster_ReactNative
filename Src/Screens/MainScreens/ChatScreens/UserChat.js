import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
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

var isMount = true;
const UserChat = () => {
  const insets = useInsets();

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
      isEnableHeader={false}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={!IS_IOS ? 0 : insets.bottom > 20 ? 50 : 20}
        behavior={IS_IOS ? 'padding' : null}
        style={{flex: 1}}>
        <ReplaceStatusBar />
        <View style={styles.headerContainer}>
          <View style={styles.leftContainer}>
            <SVGIcon icon="back" height={20} width={20} />
          </View>
        </View>
        <EncryptedMessageContainer />
        <View style={styles.chatListContainer}>{/* <FlatList  /> */}</View>

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
