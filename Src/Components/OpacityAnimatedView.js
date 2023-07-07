import {Animated} from 'react-native';
import React, {useEffect, useRef} from 'react';

const OpacityAnimatedView = ({children, opacityMinimumValue = 0.2}) => {
  const opacityAnim = useRef(new Animated.Value(opacityMinimumValue)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          duration: 500,
          useNativeDriver: true,
          toValue: 1,
        }),
        Animated.timing(opacityAnim, {
          duration: 500,
          useNativeDriver: true,
          toValue: opacityMinimumValue,
        }),
      ]),
      {
        iterations: -1,
      },
    ).start();

    return () => {
      opacityAnim.stopAnimation();
    };
  }, [opacityMinimumValue]);

  return (
    <Animated.View style={{opacity: opacityAnim}}>{children}</Animated.View>
  );
};

export default OpacityAnimatedView;
