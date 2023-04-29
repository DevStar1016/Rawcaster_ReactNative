import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import SVGIcon from '../Components/SVGIcon';

type Props = {
  closePopup: () => void;
  title?: string;
};

const InputPopup = ({closePopup, title = ''}: Props) => {
  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        style={{flexGrow: 0}}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.subContainer}>
          <View style={styles.titleContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <StyledText style={styles.titleText}>{title}</StyledText>
            </View>
            <SVGIcon
              icon="close_rounded_black"
              isButton
              height={20}
              width={20}
              onPress={closePopup}
            />
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default InputPopup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
