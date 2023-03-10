import {Image, StyleSheet, View} from 'react-native';
import React from 'react';
import {DIMENSIONS, IS_IOS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import {useInsets} from '../../../../Utilities/StoreData';

const ImageNugget = ({url, mediaHeight}) => {
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;

  return (
    <View
      style={[styles.container, {height: windowHeight, width: windowWidth}]}>
      <Image
        source={{uri: url}}
        // onLoad={event => {
        //   onLoadComplete(event.nativeEvent);
        // }}
        resizeMode="contain"
        style={{width: windowWidth, height: windowHeight}}
      />
    </View>
  );
};

export default ImageNugget;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
