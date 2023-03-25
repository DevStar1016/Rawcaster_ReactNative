import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import TextBox from '../../../Components/TextBox';
import CustomDateMonthYearPicker from '../../../Components/CustomDateMonthYearPicker';
import SVGIcon from '../../../Components/SVGIcon';
import StyledText from '../../../Components/StyledText';

const PollContainer = ({
  onPressRemovePoll,
  question,
  setquestion,
  choiceList,
  setchoiceList,
  setpollLength,
}) => {
  const handleRemoveOption = index => {
    setchoiceList(preList => {
      if (preList.length > 2) {
        return [...preList].filter((_, ind) => ind !== index);
      }
      return [...preList];
    });
  };

  function renderChoice(item, index) {
    return (
      <TextBox
        key={index.toString()}
        title={`Choice ${index + 1}` + (index > 1 ? ' (optional)' : '')}
        placeHolder={`Choice ${index + 1}` + (index > 1 ? ' (optional)' : '')}
        titlePaddingVertical={2}
        value={item.value}
        isEnableOuterRightIcon={choiceList.length > 2}
        outerRightIconProps={{
          icon: 'close_rounded_white',
          marginLeft: 10,
          height: 22,
          width: 22,
          isButton: true,
          onPress: () => {
            handleRemoveOption(index);
          },
        }}
        textColor={COLORS.white}
        onChangeText={text => {
          setchoiceList(preList => {
            let tempList = [...preList];
            tempList[index] = {
              ...tempList[index],
              value: text,
            };
            return [...tempList];
          });
        }}
        titleStyle={{color: COLORS.white}}
        backgroundColor={COLORS.transparent}
        borderColor={COLORS.white}
        maxLength={25}
      />
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.textInputContainer}>
        <TextInput
          placeholder={'Ask a question...'}
          style={styles.textInput}
          multiline
          value={question}
          onChangeText={setquestion}
          numberOfLines={2}
          textAlignVertical={'top'}
          placeholderTextColor={COLORS.white}
          maxLength={280}
        />
        {choiceList.length < 4 && (
          <View style={styles.addPollOptionsButton}>
            <SVGIcon
              icon="plus"
              height={25}
              width={25}
              isButton
              onPress={() => {
                if (choiceList.length < 4) {
                  setchoiceList(preList => [
                    ...preList,
                    {
                      isOptional: true,
                      value: '',
                    },
                  ]);
                }
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.pollContentContainer}>
        {choiceList.map((item, index) => {
          return renderChoice(item, index);
        })}
        {/* <TextBox
          title="Choice 1"
          titlePaddingVertical={2}
          titleStyle={{color: COLORS.white}}
          backgroundColor={COLORS.transparent}
          borderColor={COLORS.white}
          placeHolder="Choice 1"
        />

        <TextBox
          title="Choice 2"
          titlePaddingVertical={2}
          titleStyle={{color: COLORS.white}}
          backgroundColor={COLORS.transparent}
          borderColor={COLORS.white}
          placeHolder="Choice 2"
        /> */}
        <CustomDateMonthYearPicker
          onSelect={selectedDuration => {
            setpollLength(selectedDuration);
          }}
          valueShowAdditionalData={{
            first: 'Days',
            second: 'Hrs',
            third: 'Min',
          }}
          dropDownIcon="down_arrow_white"
          title="Poll Length"
          placeHolder={{first: 'Days', second: 'Hrs', third: 'Min'}}
          inputContainerMarginVertical={0}
          titlePaddingVertical={2}
          dropDownBackgroundColor={COLORS.transparent}
          dropDownBorderColor={COLORS.white}
          dropDownValueColor={COLORS.white}
          titleStyle={{color: COLORS.white}}
          dropDownContainerWidth={{
            first: '31%',
            second: '33%',
            third: '33%',
          }}
          pickerMode="duration_days_hrs_mins"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={onPressRemovePoll}>
            <SVGIcon
              icon="delete_white"
              height={20}
              width={20}
              marginRight={5}
            />
            <StyledText style={styles.removeButtonText}>Remove Poll</StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PollContainer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 10,
  },
  textInputContainer: {
    maxHeight: 100,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.white,
    fontSize: 15,
    minHeight: 45,
    maxHeight: 100,
  },
  pollContentContainer: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  removeButtonText: {
    color: COLORS.white,
    paddingVertical: 5,
  },
  addPollOptionsButton: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
