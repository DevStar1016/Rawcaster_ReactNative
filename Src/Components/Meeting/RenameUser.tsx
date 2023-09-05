import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {FONTS} from '../../Utilities/Fonts';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import SVGIcon from '../SVGIcon';
import RBSheetTextInput from '../RBSheetTextInput';
import SubmitButton from '../SubmitButton';

type Props = {
  onClose: () => void;
  currentName: string;
  onRenameUser: (updatedName: string) => void;
};

const RenameUser = ({onClose, currentName = '', onRenameUser}: Props) => {
  const [typedName, settypedName] = useState<string>(currentName);
  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <View style={{width: '10%'}} />

        <StyledText style={styles.title}>Rename User</StyledText>
        <View style={{width: '10%', paddingRight: 5}}>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={onClose}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={{paddingHorizontal: 15}}>
          <RBSheetTextInput
            placeholderText={`Enter Name...`}
            onPressSend={() => {}}
            containerPaddingHorizontal={10}
            isVisibleEmoji={false}
            isInsideTextChange={false}
            isVisibleProfileImage={false}
            onChangeText={settypedName}
            isVisibleSendButton={false}
            text={typedName}
            actionsContainerPaddingTop={5}
            isDisableSend={false}
            isKeyboardCloseWhenSend={true}
          />
          <View style={styles.buttonsContainer}>
            <SubmitButton
              buttonText="Cancel"
              marginTop={0}
              padding={7}
              bgColor="rgba(255, 255, 255, 0.18)"
              borderColor="rgba(255, 255, 255, 0.18)"
              buttonWidth={'45%'}
              onPress={onClose}
            />
            <SubmitButton
              buttonText="Ok"
              marginTop={0}
              padding={7}
              bgColor="rgba(255, 255, 255, 0.18)"
              borderColor="rgba(255, 255, 255, 0.18)"
              buttonWidth={'45%'}
              onPress={() => {
                onRenameUser(typedName.trim());
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default RenameUser;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderColor: COLORS.grey,
  },
  title: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
});
