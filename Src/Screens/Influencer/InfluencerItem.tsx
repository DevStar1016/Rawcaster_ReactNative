import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import ProfileWithBadge from '../../Components/ProfileWithBadge';
import SVGIcon from '../../Components/SVGIcon';
import StyledText from '../../Components/StyledText';
import {FONTS} from '../../Utilities/Fonts';
import GradientButton from '../../Components/GradientButton';
import SubmitButton from '../../Components/SubmitButton';
import {htmlDecodeText} from '../../Utilities/Methods';

type Props = {
  isSelected?: boolean;
  onPressBecomeFan?: () => void;
  onPressSelect?: () => void;
  item: any;
};

const InfluencerItem = ({
  isSelected = false,
  onPressBecomeFan,
  onPressSelect,
  item,
}: Props) => {
  return (
    <View style={styles.mainConatiner}>
      <ProfileWithBadge
        badge={'diamond'}
        containerStyle={styles.profileImageContainer}
        profileImage={item.profile_img}
      />
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            {backgroundColor: isSelected ? COLORS.primary : COLORS.dimColor},
          ]}
          activeOpacity={0.7}
          onPress={onPressSelect}>
          <SVGIcon icon="tick" />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <StyledText style={{fontFamily: FONTS.DMSans.medium, fontSize: 17}}>
            {htmlDecodeText(item.display_name)}
          </StyledText>
          <View style={styles.dot} />
          <StyledText style={{opacity: 0.7}}>
            {item.category.toString()}
          </StyledText>
        </View>
        <StyledText
          style={{paddingVertical: 5}}
          textMode="read_more"
          numberOfLines={2}>
          Lorem ipsum dolor sit amet, consectetur ipsum adipiscing elit. Donec
          suscipit ex condim ilum entum ante egest
        </StyledText>

        {isSelected ? (
          <SubmitButton
            marginTop={15}
            padding={8}
            bgColor={COLORS.primary}
            borderColor={COLORS.primary}
            buttonText="Selected"
            isDisabled={true}
            rightIcon="right_arrow_white"
          />
        ) : (
          <GradientButton
            buttonText={'Become a Fan'}
            rightIcon="right_arrow_white"
            marginTop={15}
            onPress={onPressBecomeFan}
          />
        )}
      </View>
    </View>
  );
};

export default InfluencerItem;

const styles = StyleSheet.create({
  mainConatiner: {
    paddingVertical: 5,
  },
  profileImageContainer: {
    position: 'absolute',
    zIndex: 1,
    left: 15,
  },
  contentContainer: {
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 15,
  },
  checkButton: {
    height: 30,
    width: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 30 / 2,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: COLORS.grey,
    borderRadius: 8 / 2,
    marginHorizontal: 10,
  },
});
