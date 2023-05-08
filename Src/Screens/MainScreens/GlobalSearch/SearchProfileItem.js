import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {FONTS} from '../../../Utilities/Fonts';
import {getSlicedText} from '../../../Utilities/Methods';

const SearchProfileItem = ({
  item,
  onBecomeFan,
  onConnectionRequest,
  onPressItem,
}) => {
  return (
    <TouchableOpacity
      style={styles.mainContainer}
      activeOpacity={0.8}
      onPress={onPressItem}>
      <View style={styles.leftContainer}>
        <ProfileWithBadge
          // badge={Badges(profile?.user_status_id)}
          containerStyle={styles.profile}
          isEnableGradient={false}
          profileImage={item.profile_img}
          padding={0}
          profileSize={45}
          badgeSize={20}
        />
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.headerContainer}>
          <View style={{flex: 1}}>
            <StyledText style={styles.nameText}>
              {getSlicedText(item.display_name, 18)}
            </StyledText>
          </View>
          <View style={styles.buttonsContainer}>
            {!item.follow && (
              <SubmitButton
                buttonText="Become a fan"
                marginBottom={0}
                borderColor={COLORS.primaryLight}
                bgColor={COLORS.primaryLight}
                marginTop={0}
                onPress={onBecomeFan}
                marginHorizontal={item.friend_request_status === '' ? 10 : 0}
                buttonTextStyle={{fontSize: 14}}
                paddingVertical={5}
                borderRadius={30}
              />
            )}
            {item.friend_request_status === '' && (
              <RoundedPlusButton
                style={styles.connectionRequestButton}
                onPress={onConnectionRequest}
              />
            )}
          </View>
        </View>
        <StyledText style={{paddingVertical: 5}}>
          I’ve left Muskville. Come join Me at @TheTweetOfGod@universeodon.com.
          Still can’t help plugging My book “The Book of Pslam” out now:
          tinyurl.com/yckjn828
        </StyledText>
      </View>
    </TouchableOpacity>
  );
};

export default SearchProfileItem;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  leftContainer: {
    paddingRight: 10,
  },
  profile: {
    height: 45,
    width: 45,
  },
  rightContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontFamily: FONTS.DMSans.bold,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionRequestButton: {
    height: 38,
    width: 38,
  },
});
