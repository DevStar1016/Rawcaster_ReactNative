import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {IconType} from '../Utilities/Icons';
import SVGIcon from './SVGIcon';
import LinearGradientButton from './LinearGradientButton';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';

type InfluencersProps = {
  userName?: string;
  profile?: IconType;
  badge?: IconType;
  description?: string;
  checkmark?: boolean;
};

const InfluencersItem = ({
  userName = '',
  profile,
  badge,
  description = '',
  checkmark = false,
}: InfluencersProps) => {
  return (
    <View style={styles.mainContainer}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.profileContainer}>
          <SVGIcon icon="influencer" width={56} height={56} />
        </View>
        <View style={styles.medal}>
          <SVGIcon icon="medal" width={30} height={30} />
        </View>
        <View style={styles.checkmark}>
          <SVGIcon icon="active_checkmark" width={30} height={30} />
        </View>
      </View>
      <View style={styles.profileDataContainer}>
        <StyledText style={styles.username}>user name</StyledText>
        <View style={styles.dot}></View>
        <Text style={styles.profession}>Profession</Text>
      </View>

      <StyledText style={styles.description}>
        Lorem ipsum dolor sit amet, consectetur ipsum adipiscing elit. Donec
        suscipit ex condim ilum entum ante egestas suscipit
      </StyledText>
      <TouchableOpacity>
        <StyledText style={styles.readmoreBtn}>read more</StyledText>
      </TouchableOpacity>

      <LinearGradientButton buttonText="Become a Fan" onPress={() => {}} />
    </View>
  );
};

export default InfluencersItem;

const styles = StyleSheet.create({
  mainContainer: {
    margin: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 7,
    position: 'relative',
    marginTop: 50,
  },
  profileContainer: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#F3738B',
    borderRadius: 50,
    top: -35,
    left: 16,
  },
  medal: {
    top: -13,
    left: 0,
  },
  checkmark: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginRight: 15,
  },
  profileDataContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  username: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 17,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: COLORS.transparentDimColor,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 3,
  },
  profession: {
    color: COLORS.dimColor,
  },
  description: {
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 13,
  },
  readmoreBtn: {
    color: COLORS.secondary,
    fontSize: 13,
    // backgroundColor: 'red',
  },
});
