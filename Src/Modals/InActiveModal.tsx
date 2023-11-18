import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import SubmitButton from '../Components/SubmitButton';
import SVGIcon, {SVGIconProps} from '../Components/SVGIcon';
import {IconType} from '../Utilities/Icons';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import {DIMENSIONS} from '../Utilities/Constants';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {logoutService} from '../Services/ApiService';
import {removeToken} from '../Utilities/Methods';
import {useDispatch} from 'react-redux';
import Toast from '../Components/Toast';
import {useToken} from '../Utilities/StoreData';

type Props = {
  onClose: () => void;
  onLogout?: (val: boolean) => void;
  contentTextStyle?: TextStyle;
  subContainerStyle?: ViewStyle;
  bottomTitleLogoProps?: SVGIconProps;
  bottomTitleLogo?: IconType;
  titleContainerStyle?: ViewStyle;
  bottomLogoContainerStyle?: ViewStyle;
};

const InActiveModal = ({
  onClose,
  onLogout,
  bottomTitleLogo,
  bottomTitleLogoProps,
  contentTextStyle,
  subContainerStyle,
  titleContainerStyle,
  bottomLogoContainerStyle,
}: Props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  function logOut() {
    if (onLogout) {
      onLogout(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    logoutService(formData)
      .then(res => {
        if (res.data.status === 1) {
          removeToken(dispatch);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (onLogout) {
          onLogout(false);
        }
      });
  }

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.subContainer, {...subContainerStyle}]}>
        <View style={[styles.titleContainer, {...titleContainerStyle}]}>
          <View style={{width: '10%'}} />
          <View style={styles.logoContainer}>
            <SVGIcon icon="app_text_logo_colored" height={40} width={'75%'} />
          </View>
          <View style={styles.closeButtonContainer}></View>
        </View>
        <View style={{alignItems: 'center'}}>
          {bottomTitleLogo && (
            <View style={{...bottomLogoContainerStyle}}>
              <SVGIcon icon={bottomTitleLogo} {...bottomTitleLogoProps} />
            </View>
          )}
        </View>
        <View style={{paddingHorizontal: 15, paddingBottom: 15}}>
          <View style={styles.contentContainer}>
            <StyledText
              style={{
                fontSize: 14,
                textAlign: 'center',
                paddingVertical: 5,
                ...contentTextStyle,
              }}>
              {
                'Before you can share nuggets, and chat with your friends we need to reactivate your account. Please go to Settings, click on General and switch from Inactive to Active.'
              }
            </StyledText>
          </View>
          <View style={styles.buttonsContainer}>
            <SubmitButton
              buttonText={'Go to Settings'}
              marginTop={10}
              bgColor={COLORS.yellow}
              borderColor={COLORS.yellow}
              buttonTextStyle={{fontSize: 14}}
              onPress={() => {
                if (onClose) {
                  onClose();
                }

                //@ts-ignore
                navigation.navigate('SettingsStack', {
                  screen: 'GeneralSettings',
                });
              }}
            />
            <SubmitButton
              buttonText={'Logout'}
              marginTop={10}
              bgColor={COLORS.white}
              borderColor={COLORS.yellow}
              buttonTextStyle={{fontSize: 14, color: COLORS.yellow}}
              onPress={() => {
                logOut();
                if (onClose) {
                  onClose();
                }
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default InActiveModal;

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
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
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
  titleText: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.bold,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonsContainer: {
    paddingBottom: 10,
  },
  metaDataContainer: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  metaDataImage: {
    height: DIMENSIONS.window.width / 5,
    width: DIMENSIONS.window.width / 5,
    borderRadius: 10,
  },
  metaDataTitle: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.black,
  },
  metaDataDescription: {
    color: COLORS.black,
  },
});
