import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import RadioButton from '../../../Components/RadioButton';

const GroupUserItem = ({
  item,
  groupId,
  isGroupOwner,
  isEnableEdit,
  isSelected,
  onPressItem,
  onPressRemove,
  isMe,
}) => {
  function getItemRightComponent() {
    if (groupId) {
      if (isGroupOwner) {
        return <StyledText style={{color: COLORS.secondary}}>Owner</StyledText>;
      } else if (isEnableEdit) {
        return (
          <SVGIcon
            isButton
            icon="close_white"
            height={15}
            width={15}
            onPress={onPressRemove}
          />
        );
      }
      return false;
    }
    return (
      <RadioButton
        disabled={true}
        isSelected={isSelected}
        mainContainerStyle={{marginVertical: 0}}
        radioContainerStyle={{marginRight: 0, borderColor: COLORS.white}}
        isDisabledInsideCircleOuterSpace
        radioSelectedColor={COLORS.secondary}
      />
    );
  }

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      disabled={groupId ? true : false}
      onPress={onPressItem}
      activeOpacity={0.8}>
      <ProfileWithBadge
        profileImage={item.profile_img}
        extraMargin={0}
        isEnableGradient
        padding={0}
        profileSize={50}
        containerStyle={{marginRight: 10}}
      />
      <View style={styles.displayTextContainer}>
        <StyledText
          style={{color: COLORS.white}}
          normalTextModeTextProps={{numberOfLines: 1}}>
          {`${isMe ? 'You' : item.display_name.trim()}`}
        </StyledText>
      </View>
      {getItemRightComponent(item)}
    </TouchableOpacity>
  );
};

export default GroupUserItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  displayTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
});
