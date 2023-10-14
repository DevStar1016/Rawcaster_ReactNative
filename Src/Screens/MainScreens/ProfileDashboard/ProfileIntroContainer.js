import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {FONTS} from '../../../Utilities/Fonts';
import StyledText from '../../../Components/StyledText';
import SVGIcon from '../../../Components/SVGIcon';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import TitleRowContainer from './TitleRowContainer';

const ProfileIntroContainer = ({
  userId,
  profile,
  paddingHorizontal,
  onLayout,
  isDisplayVerifyAccount = false,
  onPressVerifyAccount,
  verifyAccountButtonText,
  isDisableVerifyAccount = false,
}) => {
  const navigation = useNavigation();
  const RowContainer = ({icon, text = '', iconSize = 25}) => {
    return text ? (
      <View style={styles.rowContainer}>
        <SVGIcon
          icon={icon}
          marginRight={13}
          height={iconSize}
          width={iconSize}
        />
        <View style={{flex: 1}}>
          <StyledText>{text}</StyledText>
        </View>
      </View>
    ) : null;
  };

  return (
    <View
      style={[styles.mainContainer, {paddingHorizontal}]}
      onLayout={onLayout}>
      <TitleRowContainer
        title="Intro"
        onPressButton={() => {
          navigation.navigate('EditProfile');
        }}
        isDisplayButton={userId ? false : true}
        buttonType="rounded"
        isDisplayVerifyAccount={isDisplayVerifyAccount}
        onPressVerifyAccount={onPressVerifyAccount}
        isDisableVerifyAccount={isDisableVerifyAccount}
        verifyAccountButtonText={verifyAccountButtonText}
      />

      {profile?.work_at ? (
        <RowContainer text={`Work at ${profile?.work_at}`} icon={'work_grey'} />
      ) : (
        false
      )}
      {profile?.studied_at ? (
        <RowContainer
          text={`Studied at ${profile?.studied_at}`}
          icon={'study_grey'}
        />
      ) : (
        false
      )}
      {profile?.geo_location ? (
        <RowContainer text={profile?.geo_location} icon={'location_grey'} />
      ) : (
        false
      )}
      {profile?.dob ? (
        <RowContainer
          text={`Date of Birth ${moment(profile?.dob, 'YYYY-MM-DD').format(
            'DD/MM/YYYY',
          )}`}
          icon={'cake_grey'}
        />
      ) : (
        false
      )}
      {profile?.date_of_join ? (
        <RowContainer
          text={`Joined RAWCASTER on ${moment(profile?.date_of_join).format(
            'DD MMM YYYY',
          )}`}
          icon={'calander_grey'}
          iconSize={23}
        />
      ) : (
        false
      )}
      {profile?.user_status ? (
        <RowContainer
          text={`Rawcaster membership is ${profile?.user_status}`}
          icon={'membership_grey'}
          iconSize={28}
        />
      ) : (
        false
      )}
    </View>
  );
};

export default ProfileIntroContainer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
  },
});
