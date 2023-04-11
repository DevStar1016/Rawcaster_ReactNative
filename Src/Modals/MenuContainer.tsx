import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SubmitButton, {SubmitButtonProps} from '../Components/SubmitButton';
import StyledText from '../Components/StyledText';
import {FONTS} from '../Utilities/Fonts';

type ButtonItemProp = {
  id: number;
  buttonName: string;
};

type ButtonProp = {
  item: ButtonItemProp;
  onPress: () => void;
};

type Props = {
  setModal: (val: boolean) => void;
  buttonsOptions: ButtonItemProp[];
  onPressOption: (id: number) => void;
  submitButtonProps?: SubmitButtonProps;
};

const MenuContainer = ({
  setModal,
  buttonsOptions = [],
  onPressOption,
  submitButtonProps,
}: Props) => {
  const ButtonItem = ({item, onPress}: ButtonProp) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.buttonItemContainer}
        activeOpacity={0.7}>
        <StyledText style={styles.buttonText}>{item.buttonName}</StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={styles.mainContainer}
      onPress={() => {
        setModal(false);
      }}>
      <TouchableOpacity style={styles.contentContainer} activeOpacity={1}>
        <View style={styles.optionsContainer}>
          <FlatList
            data={buttonsOptions}
            renderItem={({item}) => {
              return (
                <ButtonItem
                  item={item}
                  onPress={() => {
                    onPressOption(item.id);
                  }}
                />
              );
            }}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => {
              return <View style={styles.divider} />;
            }}
          />
        </View>
        <SubmitButton
          buttonText="Cancel"
          onPress={() => {
            setModal(false);
          }}
          marginBottom={0}
          marginTop={0}
          borderRadius={10}
          {...submitButtonProps}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuContainer;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.transparentDimColor,
  },
  contentContainer: {
    padding: 15,
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginVertical: 15,
  },
  buttonItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  buttonText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
});
