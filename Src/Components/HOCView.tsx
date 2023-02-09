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
  paddingHorizontal?: number;
};

const HOCView = ({
  children,
  isEnableKeyboardAware = false,
  isEnableScroll = false,
  backgroundColor = COLORS.white,
  isEnableHeader = true,
  paddingHorizontal = 15,
}: Props) => {
  return (
    <View style={{flex: 1, backgroundColor: backgroundColor}}>
      {isEnableHeader && <CustomHeader />}
      {isEnableKeyboardAware ? (
        <KeyboardAwareScrollView
          extraScrollHeight={55}
          style={{paddingHorizontal}}
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{paddingHorizontal}}
              keyboardShouldPersistTaps="handled">
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
