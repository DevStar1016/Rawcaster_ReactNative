import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import DefaultBackground from './DefaultBackground';

export type LoaderProps = {
  bgColor?: string;
  loaderText?: string;
  indicatorColor?: string;
  loaderTextColor?: string;
  isEnableDefaultLoaderBackground?: boolean;
};

const Loader = ({
  bgColor = COLORS.white,
  loaderText,
  indicatorColor = COLORS.white,
  loaderTextColor = COLORS.white,
  isEnableDefaultLoaderBackground = false,
}: LoaderProps) => {
  return (
    <View style={[styles.mainContainer, {backgroundColor: bgColor}]}>
      {isEnableDefaultLoaderBackground && <DefaultBackground />}
      <ActivityIndicator color={indicatorColor} size="large" />
      {loaderText ? (
        <StyledText
          style={{color: loaderTextColor, fontSize: 14, paddingVertical: 5}}>
          {loaderText}
        </StyledText>
      ) : null}
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
