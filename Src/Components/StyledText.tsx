import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import Hyperlink from 'react-native-hyperlink';
import {TextProps} from 'react-native';

export type NormalTextModeProps = Omit<TextProps, 'onPress' | 'style'>;

export interface StyledTextProps {
  children?: JSX.Element | JSX.Element[] | string;
  textMode?: 'read_more' | 'hyper_link' | 'normal' | 'read_more_hyper_link';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  readMoreButtonTextStyle?: TextStyle;
  normalTextModeTextProps?: NormalTextModeProps;
  onPressUrl?: (value: string) => void;
  onPress?: () => void;
  onReadMore?: (value: boolean) => void;
  isReadmoreEnable?: boolean;
}

function StyledText({
  children,
  textMode = 'normal',
  numberOfLines = 0,
  isReadmoreEnable = false,
  onPress,
  onPressUrl,
  onReadMore,
  readMoreButtonTextStyle = {},
  style,
  normalTextModeTextProps,
}: StyledTextProps) {
  const [lengthMore, setLengthMore] = useState(false);
  const [isEnableFullText, setisEnableFullText] = useState(false);
  const [textLength, settextLength] = useState(1);

  const onTextLayout = useCallback((e: any) => {
    settextLength(e.nativeEvent.lines.length);
    setLengthMore(e.nativeEvent.lines.length > numberOfLines);
  }, []);

  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.text, ...style];
      }
      return [styles.text, style];
    }
    return styles.text;
  };

  function renderText() {
    return (
      <Text style={getStyle()} onPress={onPress} {...normalTextModeTextProps}>
        {children}
      </Text>
    );
  }

  const renderReadMoreText = () => {
    return (
      <View>
        {lengthMore ? (
          isEnableFullText ? (
            <Text
              textBreakStrategy="simple"
              style={[getStyle(), {height: 22 * textLength}]}
              onPress={onPress}>
              {children}
            </Text>
          ) : (
            <Text
              numberOfLines={numberOfLines}
              style={getStyle()}
              onPress={onPress}>
              {children}
            </Text>
          )
        ) : (
          <Text
            onTextLayout={onTextLayout}
            style={getStyle()}
            onPress={onPress}>
            {children}
          </Text>
        )}

        {lengthMore && isReadmoreEnable ? (
          <Text
            style={[
              styles.text,
              {color: COLORS.secondary, ...readMoreButtonTextStyle},
            ]}
            onPress={() => {
              setisEnableFullText(pre => {
                if (onReadMore) {
                  onReadMore(!pre);
                }
                return isReadmoreEnable ? pre : !pre;
              });
            }}>
            {isEnableFullText ? 'Read less' : 'Read more'}
          </Text>
        ) : null}
      </View>
    );
  };

  const hyperLinkText = (isEnableReadMore = false) => {
    return (
      <Hyperlink
        linkDefault={false}
        linkStyle={{color: '#2980b9'}}
        onPress={onPressUrl ? onPressUrl : () => {}}>
        {isEnableReadMore ? renderReadMoreText() : renderText()}
      </Hyperlink>
    );
  };

  const TextComponent = () => {
    switch (textMode) {
      case 'read_more':
        return renderReadMoreText();
      case 'hyper_link':
        return hyperLinkText();
      case 'read_more_hyper_link':
        return hyperLinkText(true);
      default:
        return renderText();
    }
  };

  return TextComponent();
}

export default StyledText;

const styles = StyleSheet.create({
  text: {
    color: COLORS.black,
    fontFamily: FONTS.DMSans.regular,
    fontSize: 14,
  },
});
