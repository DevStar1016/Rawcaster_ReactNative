import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import RadioButton from '../../../Components/RadioButton';
import SubmitButton from '../../../Components/SubmitButton';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {getIsEnableFriendRequest} from '../../../Utilities/Methods';
import {useFollowingUsersList} from '../../../Utilities/StoreData';

const UserItem = ({
  item,
  groupId,
  isGroupOwner,
  isEnableEdit,
  isSelected,
  onPressItem,
  onPressRemove,
  onBecomeFan,
  onConnectionRequest,
  isMe,
  isGroup = true,
  isProfileButton = false,
  onPressProfile,
}) => {
  const followingUsersList = useFollowingUsersList();

  const isFan = () => {
    const tempFollowingUsersList = [...followingUsersList];
    return tempFollowingUsersList.find(ele => ele.user_id === item.user_id)
      ? true
      : false;
  };

  function getItemRightComponent() {
    if (isGroup) {
      if (groupId) {
        if (isGroupOwner) {
          return (
            <StyledText style={{color: COLORS.secondary}}>Owner</StyledText>
          );
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
      <View style={styles.requestActionButtonsContainer}>
        {!isFan() && (
          <SubmitButton
            buttonText="Become a fan"
            marginTop={0}
            marginBottom={0}
            padding={0}
            marginHorizontal={10}
            paddingHorizontal={10}
            paddingVertical={3}
            buttonTextStyle={{
              fontSize: 13,
            }}
            onPress={onBecomeFan}
          />
        )}
        {getIsEnableFriendRequest(item.friend_request_status) && (
          <RoundedIconButton
            bgColor={COLORS.primaryLight}
            icon="user_plus_white"
            onPress={onConnectionRequest}
          />
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      disabled={groupId || !isGroup ? true : false}
      onPress={onPressItem}
      activeOpacity={0.8}>
      <ProfileWithBadge
        profileImage={item.profile_img}
        extraMargin={0}
        isEnableGradient
        padding={0}
        profileSize={50}
        containerStyle={{marginRight: 10}}
        isButton={isProfileButton}
        onPressProfile={onPressProfile}
      />
      <View style={styles.displayTextContainer}>
        <StyledText
          style={{color: COLORS.white}}
          normalTextModeTextProps={{numberOfLines: 1}}>
          {`${isMe && isGroup ? 'You' : item.display_name.trim()}`}
        </StyledText>
      </View>
      {getItemRightComponent()}
    </TouchableOpacity>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  displayTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
  requestActionButtonsContainer: {
    flexDirection: 'row',
  },
});
