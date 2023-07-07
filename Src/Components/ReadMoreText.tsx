import React, {useState} from 'react';
import {Pressable, Text, TextStyle, View} from 'react-native';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';

type Props = {
  numberOfCharacters: number;
  children?: string;
  textStyle?: TextStyle;
  readMoreTextStyle?: TextStyle;
};

const ReadMoreText = ({
  numberOfCharacters,
  children = '',
  textStyle = {},
  readMoreTextStyle = {},
}: Props) => {
  const [isEnableFullText, setisEnableFullText] = useState(false);

  const getSlicedText = () => {
    if (isEnableFullText) {
      return children;
    }
    return children?.slice(0, numberOfCharacters);
  };

  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          paddingRight: 5,
          color: COLORS.black,

          fontFamily: FONTS.DMSans.regular,
          ...textStyle,
        }}>
        {getSlicedText()}
        {children.length >= numberOfCharacters ? (
          <Pressable
            onPress={() => {
              setisEnableFullText(pre => !pre);
            }}
            style={{paddingLeft: 5}}>
            <Text
              style={{
                color: COLORS.secondary,
                fontSize: 16,
                fontFamily: FONTS.DMSans.medium,
                flexWrap: 'wrap',
                ...readMoreTextStyle,
              }}>
              {isEnableFullText ? ' read less' : ' read more'}
            </Text>
          </Pressable>
        ) : null}
      </Text>
    </View>
  );
};

export default ReadMoreText;
