import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import Logo from '../Assets/Svg/app_text_logo_colored.svg';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import SubmitButton from '../Components/SubmitButton';

type Props = {
  onClose: () => void;
  isEnableClose?: boolean;
  isEnableNegativeButton?: boolean;
  positiveButtonText?: string;
  negativeButtonText?: string;
  content?: string;
  onPressPositiveButton?: () => void;
  onPressNegativeButton?: () => void;
};

const ConfirmationPopup = ({
  onClose,
  isEnableClose = true,
  isEnableNegativeButton = true,
  positiveButtonText = 'Yes',
  content = '',
  negativeButtonText = 'Later',
  onPressPositiveButton,
  onPressNegativeButton,
}: Props) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <View style={styles.titleContainer}>
          <View style={{width: '10%'}} />
          <View style={styles.logoContainer}>
            <SVGIcon icon="app_text_logo_colored" height={40} width={'75%'} />
          </View>
          <View style={styles.closeButtonContainer}>
            {isEnableClose && (
              <TouchableOpacity onPress={onClose}>
                <SVGIcon icon="close" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.contentContainer}>
          <StyledText style={{fontSize: 14, paddingVertical: 5}}>
            {content}
          </StyledText>
        </View>
        <View style={styles.buttonsContainer}>
          <SubmitButton
            buttonText={positiveButtonText}
            marginTop={10}
            buttonTextStyle={{fontSize: 14}}
            onPress={onPressPositiveButton}
          />
          {isEnableNegativeButton && (
            <SubmitButton
              buttonText={negativeButtonText}
              marginTop={10}
              buttonTextStyle={{fontSize: 14}}
              bgColor={COLORS.white}
              textColor={COLORS.secondary}
              onPress={onPressNegativeButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ConfirmationPopup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    backgroundColor: COLORS.white,
    width: '85%',
    borderRadius: 10,
    padding: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '10%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonsContainer: {
    paddingBottom: 10,
  },
});
