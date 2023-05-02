import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextInputSubmitEditingEventData,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {LegacyRef, useState} from 'react';
import {COLORS} from '../Utilities/Colors';

import SVGIcon, {SVGIconProps} from './SVGIcon';
import {IconType} from '../Utilities/Icons';
import {FONTS} from '../Utilities/Fonts';
import StyledText from './StyledText';
import {TEXT_INPUT_HEIGHT} from '../Utilities/Constants';

type AppendedListProps = {
  list?: [];
  fieldName?: string;
  onRemoveItem?: (item: any) => void;
};

export type TextBoxProps = {
  placeHolder?: string;
  title?: string;
  returnKeyType?: ReturnKeyTypeOptions;
  innerRef?: LegacyRef<TextInput> | undefined;
  isSecure?: boolean;
  errorText?: string;
  icon?: IconType;
  iconHeight?: number;
  iconWidth?: number;
  value?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  mainContainerMarginTop?: number;
  isEditable?: boolean;
  backgroundColor?: string;
  isEnablePasswordConditionText?: boolean;
  passwordConditionTextStyle?: TextStyle;
  mainContainerMarginVertical?: number;
  inputContainerMarginVertical?: number;
  titlePaddingVertical?: number;
  borderColor?: string;
  titleStyle?: TextStyle;
  textColor?: string;
  isEnableOuterRightIcon?: boolean;
  outerRightIconProps?: SVGIconProps;
  multiline?: boolean;
  isVisible?: boolean;
  mainContainerWidth?: number | string;
  inputContainerHeight?: number;
  isEnableListAppend?: boolean;
  appendedListProps?: AppendedListProps;
  additionalTextInputProps?: Omit<
    TextInputProps,
    | 'ref'
    | 'value'
    | 'onChangeText'
    | 'editable'
    | 'secureTextEntry'
    | 'style'
    | 'returnKeyType'
    | 'placeholder'
    | 'keyboardType'
    | 'maxLength'
    | 'placeholderTextColor'
    | 'multiline'
    | 'textAlignVertical'
    | 'clearButtonMode'
    | 'onSubmitEditing'
  >;

  clearButtonMode?:
    | 'never'
    | 'while-editing'
    | 'unless-editing'
    | 'always'
    | undefined;

  onChangeText?: (text: string) => void;
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void | undefined;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center' | undefined;
};

const TextBox = ({
  innerRef,
  isVisible = true,
  placeHolder = '',
  title = '',
  returnKeyType,
  iconHeight = 25,
  iconWidth = 25,
  isSecure = false,
  isEnablePasswordConditionText = false,
  value = '',
  errorText = '',
  isEditable = true,
  keyboardType,
  maxLength,
  onChangeText,
  mainContainerWidth,
  passwordConditionTextStyle = {},
  mainContainerMarginVertical = 5,
  inputContainerMarginVertical = 5,
  titlePaddingVertical = 5,
  backgroundColor = COLORS.white,
  borderColor = COLORS.borderColor,
  titleStyle = {},
  textColor = COLORS.black,
  isEnableOuterRightIcon = false,
  outerRightIconProps = {},
  multiline = false,
  inputContainerHeight = TEXT_INPUT_HEIGHT,
  textAlignVertical,
  appendedListProps,
  onSubmitEditing,
  clearButtonMode,
  mainContainerMarginTop,
  isEnableListAppend = false,
  additionalTextInputProps,
}: TextBoxProps) => {
  const [isVisiblePassword, setisVisiblePassword] = useState(false);

  const getListItemText = (item: any) => {
    if (appendedListProps?.fieldName) {
      return item[appendedListProps?.fieldName];
    }
    return item;
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {
          width: mainContainerWidth,
          marginVertical: mainContainerMarginVertical,
          marginTop: mainContainerMarginTop,
          display: isVisible ? 'flex' : 'none',
        },
      ]}>
      {title && (
        <StyledText
          style={{paddingVertical: titlePaddingVertical, ...titleStyle}}>
          {title}
        </StyledText>
      )}
      {isEnableListAppend && (
        <View style={styles.listContainer}>
          {appendedListProps?.list?.map((item, index) => {
            return (
              <View key={index.toString()} style={styles.listItemContainer}>
                <StyledText>{getListItemText(item)}</StyledText>
                <SVGIcon
                  icon="close_rounded_pink"
                  height={18}
                  isButton
                  onPress={() => {
                    if (appendedListProps && appendedListProps.onRemoveItem) {
                      appendedListProps?.onRemoveItem(item);
                    }
                  }}
                  width={18}
                  marginLeft={5}
                />
              </View>
            );
          })}
        </View>
      )}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errorText ? 'red' : borderColor,
              marginVertical: inputContainerMarginVertical,
              backgroundColor,
              height: inputContainerHeight,
            },
          ]}>
          <TextInput
            ref={innerRef}
            value={value}
            onChangeText={onChangeText}
            editable={isEditable}
            secureTextEntry={isSecure ? !isVisiblePassword : false}
            style={[
              styles.inputField,
              {
                // width: isSecure ? '87%' : '100%',
                backgroundColor,
                color: textColor,
              },
            ]}
            returnKeyType={returnKeyType}
            placeholder={placeHolder}
            keyboardType={keyboardType}
            maxLength={maxLength}
            placeholderTextColor={COLORS.placeHolderColor}
            multiline={multiline}
            textAlignVertical={textAlignVertical}
            clearButtonMode={clearButtonMode}
            onSubmitEditing={onSubmitEditing}
            {...additionalTextInputProps}
          />
          {isSecure && (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.button}
                disabled={!isEditable}
                onPress={() => {
                  setisVisiblePassword(pre => !pre);
                }}>
                <SVGIcon
                  icon={isVisiblePassword ? 'visibility_on' : 'visibility_off'}
                  height={iconHeight}
                  width={iconWidth}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {isEnableOuterRightIcon && <SVGIcon {...outerRightIconProps} />}
      </View>
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText}</StyledText>
      ) : null}
      {isSecure && isEnablePasswordConditionText && (
        <StyledText style={{paddingVertical: 5, ...passwordConditionTextStyle}}>
          We recommend your password to be at least 8 characters long, contain
          uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a
          number (0-9).
        </StyledText>
      )}
    </View>
  );
};

export default TextBox;

const styles = StyleSheet.create({
  mainContainer: {
    marginVertical: 5,
  },
  inputContainer: {
    height: TEXT_INPUT_HEIGHT,
    flex: 1,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderColor,

    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    height: '100%',

    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
  },
  iconContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listItemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 5,
    marginVertical: 5,
  },
});
