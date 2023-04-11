import {Animated, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {COLORS} from '../../Utilities/Colors';

const UsersProfilesDoubleRowListLoader = ({
  itemSize,
  extraMargin,
  containerMarginHorizontal,
}) => {
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
      {[...Array(6)].map((_, index) => {
        return (
          <View
            key={index.toString()}
            style={{
              alignItems: 'center',
              marginHorizontal: containerMarginHorizontal,
              marginVertical: 10,
              width: itemSize + extraMargin,
            }}>
            <View
              style={{
                width: itemSize,
                height: itemSize,
                borderRadius: itemSize / 2,
                backgroundColor: COLORS.borderColor,
              }}
            />
            <View
              style={{
                height: 20,
                marginVertical: 5,
                width: itemSize - 20,
                borderRadius: 5,
                backgroundColor: COLORS.borderColor,
              }}
            />
          </View>
        );
      })}
    </Animated.View>
  );
};

export default UsersProfilesDoubleRowListLoader;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
  },
  subContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.lightGrey,
  },
});
