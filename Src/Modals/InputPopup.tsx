import {SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import SVGIcon from '../Components/SVGIcon';
import TextBox, {TextBoxProps} from '../Components/TextBox';
import SubmitButton, {SubmitButtonProps} from '../Components/SubmitButton';

type CountryProp = {
  id: number;
  image: string;
  name: string;
  phone_code: string;
};

type Props = {
  closePopup: () => void;
  title?: string;
  isRequired?: boolean;
  requiredErrorText?: string;
  textInputProps?: Omit<TextBoxProps, 'value' | 'onChangeText'>;
  submitButtonProps?: Omit<SubmitButtonProps, 'onPress'>;
  onSubmit: (value: string, country?: CountryProp) => void;
  regexValue?: RegExp;
  regexErrorText?: string;
  isEnableCountryCode?: boolean;
};

const InputPopup = ({
  closePopup,
  title = '',
  textInputProps,
  requiredErrorText = 'Required',
  regexErrorText = '',
  isRequired = true,
  submitButtonProps,
  onSubmit,
  isEnableCountryCode = false,
  regexValue,
}: Props) => {
  const [value, setvalue] = useState('');
  const [country, setcountry] = useState<CountryProp | undefined>(undefined);
  const [errorText, seterrorText] = useState('');
  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        // style={{flexGrow: 0}}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingVertical: 20,
          flex: 1,
        }}
        extraScrollHeight={-100}
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
          <TextBox
            value={value}
            errorText={errorText}
            onChangeText={text => {
              if (text.trim()) {
                seterrorText('');
              }
              setvalue(text);
            }}
            countryCodePickerProps={{
              listType: 'large',
              fieldName: 'phone_code',
              listFieldName: 'name',
              value: country,
              listTitle: 'Select Country Code',
              isHideErrorText: true,
              errorText:
                errorText && !country ? 'Country code is required' : '',
              bigListProps: {
                apiName: 'country',
                isAPICall: true,
                secondaryFieldName: 'phone_code',
              },
              onSelectItem: selectedItem => {
                console.log(selectedItem);

                setcountry(selectedItem);
                seterrorText('');
              },
            }}
            {...textInputProps}
          />
          <SubmitButton
            buttonText="SUBMIT"
            marginTop={5}
            onPress={() => {
              if (isEnableCountryCode && !country) {
                seterrorText('Country code is required');
                return;
              }
              if (!value.trim() && isRequired) {
                seterrorText(requiredErrorText);
                return;
              }
              if (regexValue && !regexValue.test(value)) {
                seterrorText(regexErrorText);
                return;
              }
              onSubmit(value, country);
            }}
            {...submitButtonProps}
          />
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
    paddingVertical: 15,
    paddingHorizontal: 15,
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
