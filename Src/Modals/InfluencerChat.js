import React from 'react';
import {View, StyleSheet} from 'react-native';
import HOCView from '../Components/HOCView';
import {COLORS} from '../Utilities/Colors';

const InfluencerChat = ({navigation}) => {
  return (
    <HOCView
      //   isLoading={isLoading}
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      paddingHorizontal={5}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: `Send message to Solomon`,
        isEnableBackButton: false,
        isTitleCenter: true,
        isEnableRightIcon: true,
        rightIcon: 'close_white',
        onPressRightIcon: () => {
          navigation.goBack();
        },
      }}
      isEnableDefaultBackground></HOCView>
  );
};

const styles = StyleSheet.create({});

export default InfluencerChat;
