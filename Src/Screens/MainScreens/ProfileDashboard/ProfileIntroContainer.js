import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {FONTS} from '../../../Utilities/Fonts';
import StyledText from '../../../Components/StyledText';
import SVGIcon from '../../../Components/SVGIcon';
import {useNavigation} from '@react-navigation/native';

const ProfileIntroContainer = () => {
  const navigation = useNavigation();
  const RowContainer = ({icon, text = '', iconSize = 25}) => {
    return (
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
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.rowContainer, {paddingTop: 0}]}>
        <StyledText style={styles.titleText}>Intro</StyledText>
        <RoundedIconButton
          buttonSize={30}
          iconSize={16}
          icon="edit_black"
          onPress={() => {
            navigation.navigate('EditProfile');
          }}
        />
      </View>
      <RowContainer text="Work at Rawcaster" icon={'work_grey'} />
      <RowContainer text="Studied at ABCD" icon={'study_grey'} />
      <RowContainer
        text="Alpharetta, Georgia, United State"
        icon={'location_grey'}
      />
      <RowContainer text="Date of Birth 02/03/1992" icon={'cake_grey'} />
      <RowContainer
        text="Joined RAWCASTER on 03 Jan 2020"
        icon={'calander_grey'}
        iconSize={23}
      />
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
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
});
