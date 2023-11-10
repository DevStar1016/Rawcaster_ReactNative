import {
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import TextScroll from '../../../Components/TextScroll';

const Development = () => {
  let textHeight = 50;
  const [selectedDate, setselectedDate] = useState('');

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 30,
        height: '100%',
        backgroundColor: 'grey',
      }}>
      <TextScroll
        textHeight={textHeight}
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum."
      />
      {/* <Animated.ScrollView
        contentContainerStyle={{height: textHeight}}
        onScroll={event => {
          scrollOffset.setValue(event.nativeEvent.contentOffset.y);
        }}>
        <TouchableHighlight
          underlayColor={getUnderlayColor}
          onPress={event => {
            event.preventDefault();
          }}>
          <Animated.Text
            style={{
              transform: [
                {
                  translateY: scrollOffset.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -textHeight],
                  }),
                },
              ],
            }}
            numberOfLines={0}>
          
          </Animated.Text>
        </TouchableHighlight>
      </Animated.ScrollView> */}
      {/* <CustomHourMinutePicker
        minInterval={15}
        maxHours={10}
        value={selectedDate}
        placeHolderText="Select Duration"
        onSelectItem={val => {
          setselectedDate(val);
        }}
      /> */}
    </View>
  );
};

export default Development;

const styles = StyleSheet.create({});
