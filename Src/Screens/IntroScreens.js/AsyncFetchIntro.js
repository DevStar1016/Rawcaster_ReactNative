import {Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import {IS_IOS} from '../../Utilities/Constants';
import {useInsets} from '../../Utilities/StoreData';

const AsyncFetchIntro = () => {
  const insets = useInsets();

  return (
    <View style={{flex: 1, backgroundColor: '#fff', height: '100%'}}>
      <View
        style={[
          !IS_IOS
            ? {
                height: StatusBar.currentHeight,
              }
            : {
                height: insets.top > 0 ? insets.top : 20,

                backgroundColor: COLORS.primary,
              },
        ]}>
        <StatusBar
          translucent
          backgroundColor={COLORS.primary}
          barStyle="light-content"
        />
      </View>
      <View style={{flex: 0.95}}>
        <Image
          source={require('../../Assets/Png/IntroImages/sec_intro_top_bg.png')}
          style={{
            flex: 1,
            width: '100%',
          }}
        />
        <Image
          source={require('../../Assets/Png/IntroImages/sec_intro_app_logo.png')}
          style={{
            position: 'absolute',
            bottom: 15,

            alignSelf: 'center',
          }}
        />
      </View>

      <View style={{flex: 2}}>
        <Image
          source={require('../../Assets/Png/IntroImages/sec_intro_bg.png')}
          style={{
            flex: 1,
            width: '100%',
          }}
        />
      </View>
    </View>
  );
};

export default AsyncFetchIntro;

const styles = StyleSheet.create({});
