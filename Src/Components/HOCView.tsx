import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomHeader from './CustomHeader';

type Props = {
  children: JSX.Element | JSX.Element[];
  isEnableKeyboardAware?: boolean;
  isEnableScroll?: boolean;
  backgroundColor?: string;
  isEnableHeader?: boolean;
};

const HOCView = ({
  children,
  isEnableKeyboardAware = false,
  isEnableScroll = false,
  backgroundColor = COLORS.white,
  isEnableHeader = true,
}: Props) => {
  return (
    <View style={{flex: 1, backgroundColor: backgroundColor}}>
      {isEnableHeader && <CustomHeader />}
      {isEnableKeyboardAware ? (
        <KeyboardAwareScrollView
          extraScrollHeight={55}
          enableOnAndroid={true}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={'handled'}
          // contentContainerStyle={{flex: 1}}
          scrollEnabled={true}>
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={{flex: 1}}>
          {isEnableScroll ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

export default HOCView;

const styles = StyleSheet.create({});
