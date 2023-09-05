import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import {BottomSheetFlatList, BottomSheetView} from '@gorhom/bottom-sheet';
import StyledText from '../StyledText';

type Reaction = {
  id: number;
  emoji: string;
};

type RenderProps = {
  item: Reaction;
  index: number;
};

type Props = {
  onPressEmoji?: (emoji: string) => void;
};

const Reactions = ({onPressEmoji}: Props) => {
  const reactionsData: Reaction[] = [
    {
      id: 1,
      emoji: '❤️',
    },
    {
      id: 2,
      emoji: '👍',
    },
    {
      id: 3,
      emoji: '🎉',
    },
    {
      id: 4,
      emoji: '👏',
    },
    {
      id: 5,
      emoji: '😂',
    },
    {
      id: 6,
      emoji: '😮',
    },
    {
      id: 7,
      emoji: '😢',
    },
    {
      id: 8,
      emoji: '🤔',
    },
    {
      id: 9,
      emoji: '😍',
    },
    {
      id: 10,
      emoji: '😁',
    },
    {
      id: 11,
      emoji: '🤗',
    },
    {
      id: 12,
      emoji: '👎',
    },
  ];

  const renderItem = ({item}: RenderProps) => {
    return (
      <TouchableOpacity
        style={styles.emojiItemContainer}
        activeOpacity={0.7}
        onPress={() => {
          if (onPressEmoji) onPressEmoji(item.emoji);
        }}>
        <StyledText style={styles.emojiText}>{item.emoji}</StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <BottomSheetFlatList
        data={reactionsData}
        renderItem={renderItem}
        horizontal
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={() => {
          return <View style={{height: 10, width: 10}} />;
        }}
      />
    </View>
  );
};

export default Reactions;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.transparentDimColor,
    flexDirection: 'row',
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
  },
  emojiItemContainer: {
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emojiText: {
    fontSize: 19,
  },
});
