import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';

const FansProfilesContainer = ({profileSize = 40}) => {
  const profile = useProfile();

  return (
    <View style={styles.mainContainer}>
      {[...Array(4)].map((_, index) => {
        return (
          <ProfileWithBadge
            key={index.toString()}
            profileImage={index < 3 ? profile.profile_image : null}
            profileSize={profileSize}
            containerStyle={{marginLeft: -12}}
            extraMargin={0}
            alternateProfileImageComponent={() => {
              return <StyledText style={styles.fansCountText}>400+</StyledText>;
            }}
            isEnableWhiteBorderArroundGradient={index < 3 ? false : true}
            isEnableGradient={index < 3 ? false : true}
          />
        );
      })}
    </View>
  );
};

export default FansProfilesContainer;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  extraFansCountContainer: {
    marginLeft: -12,
  },
  fansCountText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 10,
  },
});
