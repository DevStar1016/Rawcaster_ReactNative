import {
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import Hyperlink from 'react-native-hyperlink';
import {IS_IOS} from '../Utilities/Constants';

type Props = {
  children?: JSX.Element | JSX.Element[] | string;
  textMode?: 'read_more' | 'hyper_link' | 'normal' | 'read_more_hyper_link';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  readMoreButtonTextStyle?: TextStyle;
  onPressUrl?: (value: string) => void;
  onPress?: () => void;
};

const StyledText = ({
  children,
  textMode = 'normal',
  numberOfLines = 0,
  onPress,
  onPressUrl,
  readMoreButtonTextStyle = {},
  style,
}: Props) => {
  const [lengthMore, setLengthMore] = useState(false);
  const [isEnableFullText, setisEnableFullText] = useState(false);

  const onTextLayout = useCallback((e: any) => {
    setLengthMore(e.nativeEvent.lines.length > numberOfLines);
  }, []);

  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.text, ...style];
      }
      return [styles.text, {...style}];
    }
    return styles.text;
  };

  const renderText = () => {
    return (
      <Text style={getStyle()} onPress={onPress}>
        {children}
      </Text>
    );
  };

  const renderReadMoreText = () => {
    return (
      <View>
        {lengthMore ? (
          <Text
            numberOfLines={isEnableFullText ? undefined : numberOfLines}
            style={[styles.text, {...style}]}
            onPress={onPress}>
            {children}
          </Text>
        ) : (
          <Text
            onTextLayout={onTextLayout}
            style={[styles.text, {...style}]}
            onPress={onPress}>
            {children}
          </Text>
        )}

        {lengthMore ? (
          <Text
            style={[
              styles.text,
              {color: COLORS.secondary, ...readMoreButtonTextStyle},
            ]}
            onPress={() => setisEnableFullText(pre => !pre)}>
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
        onPress={onPressUrl}>
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

  return <TextComponent />;
};

export default StyledText;

const styles = StyleSheet.create({
  text: {
    color: COLORS.black,
    fontFamily: FONTS.DMSans.regular,
    fontSize: 14,
  },
});
