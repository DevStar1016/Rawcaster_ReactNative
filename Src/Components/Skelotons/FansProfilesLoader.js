import {Animated, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {COLORS} from '../../Utilities/Colors';

const FansProfilesLoader = ({profileSize}) => {
  const opacityAnim = useRef(new Animated.Value(0.2)).current;
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
          toValue: 0.2,
        }),
      ]),
      {
        iterations: -1,
      },
    ).start();

    return () => {
      opacityAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={[styles.mainContainer, {opacity: opacityAnim}]}>
      {[...Array(4)].map((_, index) => {
        return (
          <View
            key={index.toString()}
            style={[
              styles.itemContainer,
              {
                height: profileSize,
                width: profileSize,
                borderRadius: profileSize / 2,
              },
            ]}>
            <View
              style={[styles.subContainer, {borderRadius: profileSize / 2}]}
            />
          </View>
        );
      })}
    </Animated.View>
  );
};

export default FansProfilesLoader;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    marginLeft: -12,
    padding: 2,
    overflow: 'hidden',
  },
  subContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.lightGrey,
  },
});
