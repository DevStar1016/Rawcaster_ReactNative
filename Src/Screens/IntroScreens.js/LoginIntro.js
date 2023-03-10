import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
  useWindowDimensions,
  Image,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import UsersImage from '../../Assets/Png/IntroImages/background.png';
import Logo from '../../Assets/Svg/slogan_logo.svg';
import {INTRO_DATA} from '../../Utilities/Constants';

const LoginIntro = ({onSkipIntro}) => {
  const {width: windowWidth} = useWindowDimensions();
  const [isDone, setisDone] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({item, index}) => {
    return (
      <View
        style={[
          {
            width: windowWidth,
            paddingHorizontal: 20,
          },
        ]}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.poster}
            resizeMode="contain"
          />
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.heading}>{item.heading}</Text>
          <Text style={styles.content}>{item.description}</Text>
        </View>
      </View>
    );
  };
  return (
    <LinearGradient
      colors={['#F2718D', '#61366E']}
      start={{x: 1.45, y: 0.35}}
      end={{x: 0.95, y: 0.75}}
      style={styles.linearGradient}>
      <View style={styles.imagebackground}>
        <ImageBackground source={UsersImage} style={styles.background} />
      </View>
      <Logo style={[styles.logo, {width: windowWidth}]} alignSelf={'center'} />
      <FlatList
        horizontal={true}
        style={styles.scrollViewStyle}
        pagingEnabled={true}
        data={INTRO_DATA}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          {
            useNativeDriver: false,
            listener: e => {
              if (e.nativeEvent.contentOffset.x > 1320) {
                if (!isDone) {
                  setisDone(true);
                }
              } else {
                if (isDone) {
                  setisDone(false);
                }
              }
            },
          },
        )}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />

      <View style={styles.indicatorContainer}>
        {INTRO_DATA.map((image, imageIndex) => {
          const width = scrollX.interpolate({
            inputRange: [
              windowWidth * (imageIndex - 1),
              windowWidth * imageIndex,
              windowWidth * (imageIndex + 1),
            ],
            outputRange: [8, 26, 8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={imageIndex}
              style={[styles.normalDot, {width}]}
            />
          );
        })}
      </View>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 11,
          right: 10,
          paddingVertical: 5,
        }}
        onPress={onSkipIntro}>
        <Text
          style={{
            color: '#FFFFFF',
            // fontFamily: DMSANS[0],
            fontSize: 15,
          }}>
          {isDone ? 'Done' : 'Skip'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingVertical: 20,
  },
  imagebackground: {
    height: '45%',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  background: {
    height: '100%',
    width: '100%',
  },

  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewStyle: {
    marginVertical: 50,
  },

  indicatior: {
    height: 20,
    width: 20,
    alignSelf: 'center',
  },

  logo: {
    height: 35,
    marginTop: 50,
  },
  poster: {
    height: 330,
  },
  footerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    color: '#fff',
    paddingBottom: 10,
    // fontFamily: GILROY[1],
  },
  content: {
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    // fontFamily: DMSANS[0],
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});

export default LoginIntro;
