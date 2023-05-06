import {Animated, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  percentage: string;
  name: string;
  animatedBgColor?: string;
  isGradient?: boolean;
  mainContainerStyle?: ViewStyle;
};
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedBgFillContainer = ({
  percentage,
  name = '',
  animatedBgColor = COLORS.secondary,
  mainContainerStyle = {},
  isGradient = true,
}: Props) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      duration: 1250,
      toValue: Math.round(parseFloat(percentage)),
      useNativeDriver: false,
    }).start();
  }, [percentage]);
  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.mainContainer, {...mainContainerStyle}]}>
      {isGradient ? (
        <AnimatedLinearGradient
          colors={COLORS.pollGradientColors}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={[
            styles.animatedContainer,
            {width, backgroundColor: animatedBgColor},
          ]}
        />
      ) : (
        <Animated.View
          style={[
            styles.animatedContainer,
            {width, backgroundColor: animatedBgColor},
          ]}
        />
      )}
      <View style={{flex: 1}}>
        <StyledText
          style={{
            fontFamily: FONTS.DMSans.medium,
            padding: 10,
            color: COLORS.white,
          }}>
          {name}
        </StyledText>
      </View>
      <StyledText
        style={{
          fontFamily: FONTS.DMSans.medium,
          padding: 10,
          color: COLORS.white,
        }}>
        {percentage + ' %'}
      </StyledText>
    </View>
  );
};

export default AnimatedBgFillContainer;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: 'rgba(241, 240, 240,0.1)',
    justifyContent: 'space-between',
  },
  animatedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
  },
});
