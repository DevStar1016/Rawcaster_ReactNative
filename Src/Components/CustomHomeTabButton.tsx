import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';
import {IconType} from '../Utilities/Icons';
import {useNuggetType, useTabType} from '../Utilities/StoreData';

type ButtonContentProps = {
  icon?: IconType;
};
type CustomHomeTabButtonProps = {
  onPress: () => void;
  isLoading?: boolean;
};

const CustomHomeTabButton = ({
  onPress,
  isLoading = false,
}: CustomHomeTabButtonProps) => {
  const nuggetType = useNuggetType();
  const tabType = useTabType();

  const ButtonContent = ({icon = 'app_logo_white'}: ButtonContentProps) => {
    return (
      <>
        <SVGIcon icon={icon} height={20} width={20} />
        <StyledText style={styles.buttonText}>Home</StyledText>
      </>
    );
  };

  const GradientHomeButton = () => {
    return (
      <LinearGradient
        colors={COLORS.gradientColorsSecondary}
        start={{x: 1, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.buttonContainer}>
        <ButtonContent />
      </LinearGradient>
    );
  };

  const ImageVideoHomeButton = () => {
    return (
      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor:
              nuggetType === 1 ? COLORS.secondary : COLORS.primary,
          },
        ]}>
        <ButtonContent icon={nuggetType === 1 ? 'image' : 'video'} />
      </View>
    );
  };

  const LoadingButton = () => {
    return (
      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor:
              nuggetType === 1 ? COLORS.secondary : COLORS.primary,
          },
        ]}>
        <ActivityIndicator size={'large'} color={COLORS.white} />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        disabled={isLoading}
        onPress={onPress}
        activeOpacity={0.9}>
        {isLoading ? (
          <LoadingButton />
        ) : tabType === 1 ? (
          <ImageVideoHomeButton />
        ) : (
          <GradientHomeButton />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomHomeTabButton;

const styles = StyleSheet.create({
  mainContainer: {
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    marginBottom: 40,
    // transform: [{translateY: -20}],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 12,
  },
});
